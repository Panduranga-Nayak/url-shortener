import { Consumer } from "kafkajs";
import { KafkaClient } from "../boot/kafka";
import { AbstractLogger } from '../logger/abstractLogger';
import { LoggerRegistry } from '../logger/loggerRegistry'

const log: AbstractLogger = LoggerRegistry.getLogger(); 

export abstract class AbstractKafkaConsumer {
  protected consumer: Consumer;
  private isConnected = false;
  private groupId: string;
  private topics: string[];

  constructor(groupId: string, topics: string[]) {
    const kafka = KafkaClient.getInstance();
    this.consumer = kafka.consumer({ groupId });
    this.groupId = groupId;
    this.topics = topics;
  }

  private async ensureConnected() {
    if (!this.isConnected) {
      await this.consumer.connect();
      this.isConnected = true;
      log.info(`✅ Kafka Consumer Connected for group: ${this.groupId}`);
    }
  }

  private async subscribeToTopics() {
    await this.ensureConnected();
    await this.consumer.subscribe({ topics: this.topics, fromBeginning: false });
    log.info(`✅ Subscribed to topics: ${this.topics.join(", ")} for group ${this.groupId}`);
  }

  public async start() {
    await this.subscribeToTopics();
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (message.value) {
          try {
            const parsedMessage = JSON.parse(message.value.toString());
            log.info("Kafka Message Received", { topic, message: parsedMessage });
            await this.processMessage(parsedMessage);
          } catch (error) {
            console.error("Failed to parse Kafka message:", error);
          }
        }
      },
    });
  }

  protected abstract processMessage(message: Record<string, any>): Promise<void>;

  public async disconnect() {
    if (this.isConnected) {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log(`🛑 Kafka Consumer Disconnected for group: ${this.groupId}`);
    }
  }
}
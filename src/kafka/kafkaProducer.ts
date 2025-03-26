import { Producer } from "kafkajs";
import { KafkaClient } from "../boot/kafka";
import { LoggerRegistry } from "../logger/loggerRegistry";

const log = LoggerRegistry.getLogger();

export class KafkaProducer {
  private static instance: KafkaProducer;
  private producer: Producer;
  private isConnected = false;

  private constructor() {
    const kafka = KafkaClient.getInstance();
    this.producer = kafka.producer();
  }

  public static getInstance(): KafkaProducer {
    if (!this.instance) {
      this.instance = new KafkaProducer();
    }
    return this.instance;
  }

  private async ensureConnected() {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log("✅ Kafka Producer Connected");
    }
  }

  public async sendMessage(topic: string, message: object) {
    try {
      await this.ensureConnected();
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      log.info(`📤 Sent message to ${topic}:`, message);
    } catch (error) {
      log.error("❌ Kafka Producer Send Error:", error);
    }
  }

  public async disconnect() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log("🛑 Kafka Producer Disconnected");
    }
  }
}
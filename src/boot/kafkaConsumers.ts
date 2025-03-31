import { KafkaClickEvent } from "../kafka/kafkaClickEvent";
import { KafkaEmailEvent } from "../kafka/kafkaEmailEvent";

const clickConsumer = KafkaClickEvent.getInstance();
const emailConsumer = KafkaEmailEvent.getInstance();


export async function startKafkaConsumers() {
  clickConsumer.start();
  emailConsumer.start();
}

export async function stopKafkaConsumers() {
  console.log("🛑 Shutting down Kafka Consumers...");
  await emailConsumer.disconnect();
}
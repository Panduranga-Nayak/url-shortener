import { KafkaEmailEvent } from "../kafka/kafkaEmailEvent";

const emailConsumer = KafkaEmailEvent.getInstance();

export async function startKafkaConsumers() {
  emailConsumer.start();
}

export async function stopKafkaConsumers() {
  console.log("🛑 Shutting down Kafka Consumers...");
  await emailConsumer.disconnect();
}
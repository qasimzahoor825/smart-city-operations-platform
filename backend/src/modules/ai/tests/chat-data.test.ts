import { UserRole } from "@smartcity/common";
import { answerWithData } from "../service/data";
import { complaintRepository } from "../../complaints/repository";
import { paymentRepository } from "../../payments/repository";
import { emergencyRepository } from "../../emergency/repository";
import { notificationRepository } from "../../notifications/repository";
import { appointmentRepository } from "../../appointments/repository";

const citizen = {
  sub: "usr_seed_citizen1",
  id: "usr_seed_citizen1",
  email: "citizen@smartcity.gov",
  role: UserRole.CITIZEN,
};

describe("answerWithData (data-backed assistant)", () => {
  beforeEach(() => {
    complaintRepository.reset();
    paymentRepository.reset();
    emergencyRepository.reset();
    notificationRepository.reset();
    appointmentRepository.reset();
  });

  it("answers bill questions from the citizen's real bills", () => {
    const answer = answerWithData({ message: "Show me my pending bills" }, citizen);
    expect(answer.intent).toBe("my_bills");
    expect(answer.reply).toContain("pending bill");
    expect(answer.reply).toContain("570.00");
    expect(answer.suggestions.length).toBeGreaterThan(0);
  });

  it("reports the citizen's own complaints with live counts", () => {
    const answer = answerWithData({ message: "What is the status of my complaints?" }, citizen);
    expect(answer.intent).toBe("my_complaints");
    expect(answer.reply).toContain("3 complaint");
    expect(answer.reply).toContain("2 open");
  });

  it("answers city-wide complaint questions with real totals", () => {
    const answer = answerWithData({ message: "How many complaints are open right now?" }, citizen);
    expect(answer.intent).toBe("city_complaints");
    expect(answer.dataBrief).toContain("total complaints");
    expect(answer.reply).toMatch(/open/);
  });

  it("reports active emergencies from the emergency registry", () => {
    const answer = answerWithData({ message: "Are there any active emergencies?" }, citizen);
    expect(answer.intent).toBe("emergencies");
    expect(answer.reply).toMatch(/\d+ active emergencies?/);
    expect(answer.dataBrief).toContain("active emergencies");
  });

  it("includes live IoT anomaly figures in the data brief", () => {
    const answer = answerWithData({ message: "Any sensor anomalies?" }, citizen);
    expect(answer.intent).toBe("iot_status");
    expect(answer.dataBrief).toContain("sensors live");
    expect(answer.dataBrief).toMatch(/anomalies/);
  });

  it("falls back to a helpful prompt for unknown questions", () => {
    const answer = answerWithData({ message: "Tell me a recipe for biryani" }, citizen);
    expect(answer.intent).toBe("fallback");
    expect(answer.reply.length).toBeGreaterThan(20);
  });
});
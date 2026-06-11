import type { EmergencyUpdatePayload } from "@/services/signalr";
import type { EmergencyAssignedPayload } from "@/types/emergency";

export function mergeEmergencyUpdate(
  current: EmergencyAssignedPayload,
  update: EmergencyUpdatePayload,
): EmergencyAssignedPayload {
  if (current.emergencyId !== update.emergencyId) {
    return current;
  }

  return {
    ...current,
    location: update.location,
    initiatorName: update.initiatorName,
    symptoms: update.symptoms,
    diseases: update.diseases,
    allergies: update.allergies,
  };
}

/**
 * Single source of truth for the current learner identity.
 * In a real app this would come from auth/session; here we keep it
 * centralized so instructor and learner views always talk about
 * the same learner when showing personalized progress and interventions.
 */
export const CURRENT_LEARNER_ID = "member-1";


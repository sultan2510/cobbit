export type Member = {
  full_name: string;
  email: string;
  phone: string;
  university: string;
  university_email?: string;
  student_id_proof_url: string;
};

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type Registration = {
  id: string;
  profile_id: string;
  type: "individual" | "team";
  team_name: string | null;
  members: Member[];
  fee_amount: number;
  transaction_id: string;
  payment_screenshot_url: string;
  status: RegistrationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionStatus = "not_submitted" | "submitted" | "winner";

export type Submission = {
  id: string;
  registration_id: string;
  project_title: string | null;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  video_url: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "participant" | "admin";
  created_at: string;
};

export type EventSettings = {
  id: number;
  event_name: string;
  registration_start: string; // date, e.g. "2026-08-10"
  registration_end: string;
  hackathon_start: string;
  hackathon_end: string;
  submission_deadline: string;
  prize_amount: string;
  discord_link: string;
  whatsapp_link: string;
  updated_at: string;
};

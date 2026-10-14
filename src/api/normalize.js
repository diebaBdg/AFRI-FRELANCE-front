export function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

export function mapAccountType(roles = [], activeMode) {
  const codes = (Array.isArray(roles) ? roles : []).map((r) => String(r).toUpperCase());
  if (codes.includes("ADMIN") || codes.includes("ROLE_ADMIN")) return "ROLE_ADMIN";
  if (codes.includes("SUPERVISEUR") || codes.includes("ROLE_MODERATOR")) return "ROLE_MODERATOR";
  if (String(activeMode || "").toUpperCase() === "FREELANCE") return "ROLE_FREELANCER";
  return "ROLE_CLIENT";
}

export function toActiveMode(accountType) {
  if (accountType === "ROLE_FREELANCER" || accountType === "ROLE_VERIFIED_FREELANCER") return "FREELANCE";
  return "CLIENT";
}

export function normalizeUser(info, summary = {}, login = {}) {
  const roles = login.roles || summary.roles || info.roles || [];
  const activeMode = pick(info, "activeMode", "active_mode") || pick(summary, "activeMode", "active_mode");
  const accountType = mapAccountType(roles, activeMode);
  const id = pick(info, "id", "userId") || pick(summary, "userId", "id") || login.id;
  const fullName = pick(info, "fullName", "full_name") || login.fullName || "";
  const avatarUrl = pick(info, "avatarUrl", "avatar_url") || pick(summary, "avatarUrl", "avatar_url") || "";
  return {
    ...info,
    ...summary,
    id,
    username: pick(info, "username") || login.username,
    email: pick(info, "email") || login.email,
    fullName,
    full_name: fullName,
    display_name: pick(info, "displayName", "display_name") || fullName,
    avatarUrl,
    avatar_url: avatarUrl,
    phone: pick(info, "phone"),
    country: pick(info, "country"),
    city: pick(info, "city"),
    timezone: pick(info, "timezone"),
    language: pick(info, "primaryLanguage", "language"),
    headline: pick(info, "headline") || pick(summary, "headline"),
    bio: pick(info, "bio"),
    roles,
    activeMode,
    account_type: accountType,
    role: accountType === "ROLE_ADMIN" ? "admin" : "user",
  };
}

export function normalizeProject(dto) {
  if (!dto) return dto;
  const skills = pick(dto, "skillsRequired", "skills") || [];
  return {
    ...dto,
    created_by_id: pick(dto, "clientId", "created_by_id"),
    created_date: pick(dto, "createdAt", "created_date"),
    budget_min: pick(dto, "budgetMin", "budget_min"),
    budget_max: pick(dto, "budgetMax", "budget_max"),
    budget_type: pick(dto, "projectType", "budget_type") || "fixed",
    client_name: pick(dto, "clientName", "client_name"),
    skills: Array.isArray(skills) ? skills : [],
    deadline: pick(dto, "expectedStartDate", "deadline") || "",
    status: String(pick(dto, "status") || "OPEN").toLowerCase() === "open" ? "published" : String(pick(dto, "status") || "").toLowerCase(),
  };
}

export function toProjectRequest(data = {}) {
  return {
    title: data.title,
    description: data.description,
    projectType: data.projectType || data.budget_type || data.budgetType,
    budgetMin: data.budgetMin ?? data.budget_min,
    budgetMax: data.budgetMax ?? data.budget_max,
    currency: data.currency || "XOF",
    estimatedDurationDays: data.estimatedDurationDays ?? data.delay_days,
    expectedStartDate: data.expectedStartDate || data.deadline || null,
    category: data.category,
    skillsRequired: data.skillsRequired || data.skills || [],
    country: data.country,
    isRemote: data.isRemote ?? true,
  };
}

export function normalizeProposal(dto) {
  if (!dto) return dto;
  return {
    ...dto,
    project_id: pick(dto, "projectId", "project_id"),
    project_title: pick(dto, "projectTitle", "project_title"),
    created_by_id: pick(dto, "freelanceId", "created_by_id"),
    freelancer_name: pick(dto, "freelanceName", "freelancer_name"),
    freelancer_id: pick(dto, "freelanceId", "freelancer_id"),
    price: pick(dto, "proposedAmount", "price"),
    delay_days: pick(dto, "estimatedDurationDays", "delay_days"),
    message: pick(dto, "coverLetter", "message"),
    created_date: pick(dto, "createdAt", "created_date"),
    status: String(pick(dto, "status") || "").toLowerCase(),
  };
}

export function toProposalRequest(data = {}) {
  return {
    proposedAmount: Number(data.proposedAmount ?? data.price),
    currency: data.currency || "XOF",
    estimatedDurationDays: data.estimatedDurationDays ?? data.delay_days ? Number(data.estimatedDurationDays ?? data.delay_days) : null,
    coverLetter: data.coverLetter || data.message || "",
    attachmentUrl: data.attachmentUrl || data.attachment_url,
  };
}

export function normalizeContract(dto) {
  if (!dto) return dto;
  return {
    ...dto,
    project_id: pick(dto, "projectId", "project_id"),
    project_title: pick(dto, "projectTitle", "project_title"),
    client_id: pick(dto, "clientId", "client_id"),
    client_name: pick(dto, "clientName", "client_name"),
    freelancer_id: pick(dto, "freelanceId", "freelancer_id"),
    freelancer_name: pick(dto, "freelanceName", "freelancer_name"),
    price: pick(dto, "amount", "price"),
    delay_days: pick(dto, "estimatedDays", "delay_days"),
    created_date: pick(dto, "createdAt", "created_date"),
    status: String(pick(dto, "status") || "").toLowerCase(),
  };
}

const PAYMENT_TYPE_MAP = {
  ESCROW_DEPOSIT: "escrow_in",
  FREELANCE_PAYOUT: "earning",
  REFUND: "refund",
  COMMISSION: "fee",
};

const PAYMENT_STATUS_MAP = {
  PENDING: "pending",
  ESCROWED: "completed",
  RELEASED: "completed",
  REFUNDED: "completed",
  FAILED: "failed",
};

const AVAILABILITY_STATUS_TO_API = {
  available_now: "AVAILABLE",
  available_soon: "SOON",
  unavailable: "UNAVAILABLE",
  AVAILABLE: "AVAILABLE",
  SOON: "SOON",
  UNAVAILABLE: "UNAVAILABLE",
};

const AVAILABILITY_STATUS_FROM_API = {
  AVAILABLE: "available_now",
  SOON: "available_soon",
  UNAVAILABLE: "unavailable",
};

const AVAILABILITY_TYPE_TO_API = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  per_project: "PER_PROJECT",
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  PER_PROJECT: "PER_PROJECT",
};

const AVAILABILITY_TYPE_FROM_API = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  PER_PROJECT: "per_project",
};

const COMPANY_SIZE_TO_API = {
  solo: "SOLO",
  small: "SME",
  medium: "SME",
  large: "LARGE",
  enterprise: "LARGE",
  SOLO: "SOLO",
  SME: "SME",
  LARGE: "LARGE",
};

const COMPANY_SIZE_FROM_API = {
  SOLO: "solo",
  SME: "medium",
  LARGE: "large",
};

export function normalizePayment(dto) {
  if (!dto) return dto;
  const paymentType = pick(dto, "paymentType", "type");
  const rawStatus = String(pick(dto, "status") || "").toUpperCase();
  return {
    ...dto,
    user_id: pick(dto, "payerId", "payeeId", "user_id"),
    type: PAYMENT_TYPE_MAP[paymentType] || String(paymentType || "").toLowerCase(),
    amount: pick(dto, "amount"),
    currency: pick(dto, "currency") || "XOF",
    status: PAYMENT_STATUS_MAP[rawStatus] || String(pick(dto, "status") || "").toLowerCase(),
    description: pick(dto, "providerName", "transactionRef", "description") || paymentType,
    created_date: pick(dto, "createdAt", "paidAt", "created_date"),
    checkoutUrl: pick(dto, "checkoutUrl"),
  };
}

export function normalizeConversation(dto) {
  if (!dto) return dto;
  return {
    ...dto,
    participant_a_id: pick(dto, "user1Id", "participant_a_id"),
    participant_a_name: pick(dto, "user1Name", "participant_a_name"),
    participant_b_id: pick(dto, "user2Id", "participant_b_id"),
    participant_b_name: pick(dto, "user2Name", "participant_b_name"),
    last_message: pick(dto, "lastMessageContent", "last_message"),
    last_time: pick(dto, "lastMessageAt", "last_time"),
    updated_date: pick(dto, "lastMessageAt", "updatedAt", "updated_date"),
    project_title: pick(dto, "projectTitle", "project_title"),
    unread: pick(dto, "unreadCount") || 0,
  };
}

export function normalizeMessage(dto) {
  if (!dto) return dto;
  return {
    ...dto,
    conversation_id: pick(dto, "conversationId", "conversation_id"),
    sender_id: pick(dto, "senderId", "sender_id"),
    sender_name: pick(dto, "senderName", "sender_name"),
    body: pick(dto, "content", "body"),
    attachments: pick(dto, "attachmentUrl") ? [{ url: dto.attachmentUrl, name: "pièce jointe" }] : [],
    created_date: pick(dto, "sentAt", "createdAt", "created_date"),
  };
}

export function normalizeFreelancerProfile(dto) {
  if (!dto) return dto;
  const skills = pick(dto, "skills", "topSkills") || [];
  return {
    ...dto,
    id: pick(dto, "id", "userId", "username"),
    user_id: pick(dto, "userId", "user_id"),
    userId: pick(dto, "userId", "user_id"),
    username: pick(dto, "username"),
    full_name: pick(dto, "fullName", "full_name"),
    headline: pick(dto, "title", "headline"),
    bio: pick(dto, "overview", "bio"),
    avatar_url: pick(dto, "avatarUrl", "avatar_url"),
    hourly_rate: pick(dto, "hourlyRate", "hourly_rate"),
    daily_rate: pick(dto, "dailyRate", "daily_rate"),
    min_project_rate: pick(dto, "minProjectRate", "min_project_rate"),
    availability_status: AVAILABILITY_STATUS_FROM_API[pick(dto, "availabilityStatus", "availability_status")] || pick(dto, "availabilityStatus", "availability_status"),
    availability_commitment: AVAILABILITY_TYPE_FROM_API[pick(dto, "availabilityType", "availability_commitment")] || pick(dto, "availabilityType", "availability_commitment"),
    hours_per_week: pick(dto, "weeklyHours", "hours_per_week"),
    verified: pick(dto, "isVerified", "verified") || false,
    active: pick(dto, "profileActive", "active") !== false,
    rating: pick(dto, "avgRating", "rating") || 0,
    reviews: pick(dto, "totalReviews", "reviews") || 0,
    skills,
    experience: pick(dto, "experiences", "experience") || [],
    education: pick(dto, "educations", "education") || [],
    certifications: pick(dto, "certifications") || [],
    languages: pick(dto, "languages") || [],
    portfolio: pick(dto, "portfolioItems", "portfolio") || [],
    links: pick(dto, "professionalLinks", "links") || {},
    preferences: pick(dto, "workPreference", "preferences") || { work_types: [], project_types: [], countries: [] },
  };
}

export function toFreelanceProfileRequest(data = {}) {
  return {
    title: data.title || data.headline || "Freelance",
    overview: data.overview || data.bio || "",
    country: data.country,
    city: data.city,
    hourlyRate: data.hourlyRate ?? data.hourly_rate,
    dailyRate: data.dailyRate ?? data.daily_rate,
    minProjectRate: data.minProjectRate ?? data.min_project_rate,
    currency: data.currency || "XOF",
    availabilityStatus: AVAILABILITY_STATUS_TO_API[data.availabilityStatus || data.availability_status] || data.availabilityStatus || data.availability_status,
    availabilityType: AVAILABILITY_TYPE_TO_API[data.availabilityType || data.availability_commitment] || data.availabilityType || data.availability_commitment,
    weeklyHours: data.weeklyHours ?? data.hours_per_week,
    profileActive: data.profileActive ?? data.active ?? true,
  };
}

export function normalizeClientProfile(dto) {
  if (!dto) return dto;
  return {
    ...dto,
    user_id: pick(dto, "userId", "user_id"),
    display_name: pick(dto, "displayName", "display_name"),
    kind: String(pick(dto, "clientType", "kind") || "INDIVIDUAL").toUpperCase() === "COMPANY" ? "company" : "individual",
    bio: pick(dto, "overview", "bio"),
    active: pick(dto, "profileActive", "active") !== false,
  };
}

export function toClientProfileRequest(data = {}) {
  return {
    displayName: data.displayName || data.display_name,
    clientType: String(data.clientType || data.kind || "INDIVIDUAL").toUpperCase() === "COMPANY" || data.kind === "company" ? "COMPANY" : "INDIVIDUAL",
    overview: data.overview || data.bio || "",
    country: data.country,
    city: data.city,
    profileActive: data.profileActive ?? data.active ?? true,
  };
}

export function normalizeCompany(dto) {
  if (!dto) return dto;
  const name = pick(dto, "commercialName", "legalName", "name");
  const size = pick(dto, "size");
  return {
    ...dto,
    name,
    commercialName: pick(dto, "commercialName", "name"),
    legal_name: pick(dto, "legalName", "legal_name"),
    size: COMPANY_SIZE_FROM_API[size] || String(size || "").toLowerCase(),
    logo_url: pick(dto, "logoUrl", "logo_url"),
    owner_id: pick(dto, "ownerId", "owner_id"),
  };
}

export function toCompanyRequest(data = {}) {
  return {
    commercialName: data.commercialName || data.name,
    legalName: data.legalName || data.legal_name || data.name,
    sector: data.sector,
    size: COMPANY_SIZE_TO_API[data.size] || data.size,
    country: data.country,
    city: data.city,
    website: data.website,
    description: data.description,
    logoUrl: data.logoUrl || data.logo_url,
  };
}

export function normalizeNotification(dto) {
  if (!dto) return dto;
  return {
    id: dto.id,
    type: String(dto.type || "info").toLowerCase(),
    title: dto.type || "Notification",
    text: dto.message || "",
    time: dto.createdAt,
    unread: dto.isRead === false,
    link: dto.entityId ? `/projects/${dto.entityId}` : "/notifications",
  };
}

export function toPersonalInfoRequest(user, patch = {}) {
  const merged = { ...user, ...patch };
  return {
    fullName: merged.fullName || merged.full_name || merged.display_name,
    username: String(merged.username || "").replace(/^@/, ""),
    headline: merged.headline,
    bio: merged.bio,
    country: merged.country,
    city: merged.city,
    timezone: merged.timezone,
    primaryLanguage: merged.primaryLanguage || merged.language,
    avatarUrl: merged.avatarUrl || merged.avatar_url,
    defaultCurrency: merged.defaultCurrency || merged.currency || "XOF",
  };
}

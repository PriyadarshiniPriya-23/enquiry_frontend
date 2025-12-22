export interface Subject {
    id: number;
    name: string;
    code: string;
}

export interface Package {
    id: number;
    name: string;
    code: string;
    Subjects?: Subject[];
}

export interface Enquiry {
    id: number;
    name: string;
    email: string;
    phone: string;
    current_location: string;
    packageId: number | null;
    subjectIds: number[];
    trainingMode: string;
    trainingTime: string;
    startTime: string;
    profession: string;
    qualification: string;
    experience: string;
    referral: string;
    consent: boolean;
    candidateStatus: string; // The "Deal Stage"
    demoStatus?: string; // New field requested
    createdAt: string;
    updatedAt: string;
}

export interface BillingDetails {
    total: number;
    paid: number;
    discount: number;
}

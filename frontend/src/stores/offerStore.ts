import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PositionOffer {
  id: number;
  company: string;
  sender: string;
  position: string;
  date: string;
  message: string;
  jobTitle: string;
  salary: string;
  location: string;
  tags: string[];
  jobId?: number;
}

export interface InterviewOffer {
  id: number;
  company: string;
  position: string;
  date: string;
  status: string;
  content: string;
  location: string;
  jobId?: number;
}

interface OfferState {
  positionOffers: PositionOffer[];
  interviewOffers: InterviewOffer[];
  addPositionOffer: (offer: PositionOffer) => void;
  deletePositionOffer: (id: number) => void;
  addInterviewOffer: (offer: InterviewOffer) => void;
  deleteInterviewOffer: (id: number) => void;
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set) => ({
      positionOffers: [],
      interviewOffers: [],

      addPositionOffer: (offer) =>
        set((s) => ({ positionOffers: [offer, ...s.positionOffers] })),
      deletePositionOffer: (id) =>
        set((s) => ({
          positionOffers: s.positionOffers.filter((o) => o.id !== id),
        })),

      addInterviewOffer: (offer) =>
        set((s) => ({ interviewOffers: [offer, ...s.interviewOffers] })),
      deleteInterviewOffer: (id) =>
        set((s) => ({
          interviewOffers: s.interviewOffers.filter((o) => o.id !== id),
        })),
    }),
    { name: "nextenter_offer_store" },
  ),
);

import { apiRequest } from './client';
import type { ApiDataResponse } from './types';

export type ClientEnquiryJobPayload = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  experienceRequired: string;
  numberOfResources: string;
};

export type ClientEnquirySubmitPayload = {
  companyName: string;
  companyDomain?: string;
  location: string;
  timezone: string;
  companyWebsite: string;
  contactPersonName: string;
  email: string;
  phone: string;
  jobs: ClientEnquiryJobPayload[];
  additionalRequirements: string;
};

export type ClientEnquirySubmitResponse = {
  id: number;
  referenceCode: string;
  message: string;
};

export const clientEnquiriesApi = {
  submit: async (
    payload: ClientEnquirySubmitPayload,
    files: File[],
  ): Promise<ClientEnquirySubmitResponse> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    for (const file of files) {
      formData.append('attachments', file, file.name);
    }

    const json = await apiRequest<ApiDataResponse<ClientEnquirySubmitResponse>>(
      '/public/client-enquiries',
      {
        method: 'POST',
        body: formData,
        auth: false,
      },
    );
    return json.data;
  },
};

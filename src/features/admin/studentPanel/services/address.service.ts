export interface District {
  id: string | number;
  name: string;
  bn_name?: string;
  lat?: string;
  long?: string;
  [key: string]: unknown;
}

export interface SubDistrict {
  id: string | number;
  district_id: string | number;
  name: string;
  bn_name?: string;
  [key: string]: unknown;
}

interface DistrictApiResponse {
  success?: boolean;
  data?: District[];
  [key: string]: unknown;
}

interface SubDistrictApiResponse {
  success?: boolean;
  data?: SubDistrict[];
  [key: string]: unknown;
}

export const addressService = {
  async fetchDistricts(): Promise<District[]> {
    const res = await fetch(
      "https://bdaddressapi.vercel.app/api/v1/districts/all",
    );
    if (!res.ok) throw new Error("Failed to fetch districts data.");

    const data: DistrictApiResponse = await res.json();
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error("Invalid districts payload");
    }

    return data.data;
  },

  async fetchSubDistricts(): Promise<SubDistrict[]> {
    const res = await fetch(
      "https://bdaddressapi.vercel.app/api/v1/sub-districts/all",
    );
    if (!res.ok) throw new Error("Failed to fetch sub-districts data.");

    const data: SubDistrictApiResponse = await res.json();
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error("Invalid sub-districts payload");
    }

    return data.data;
  },
};

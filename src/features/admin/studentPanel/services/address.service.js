export const addressService = {
  async fetchDistricts() {
    const res = await fetch(
      'https://bdaddressapi.vercel.app/api/v1/districts/all',
    );
    if (!res.ok) throw new Error('Failed to fetch districts data.');
    const data = await res.json();
    if (!data?.success || !Array.isArray(data.data))
      throw new Error('Invalid districts payload');
    return data.data;
  },

  async fetchSubDistricts() {
    const res = await fetch(
      'https://bdaddressapi.vercel.app/api/v1/sub-districts/all',
    );
    if (!res.ok) throw new Error('Failed to fetch sub-districts data.');
    const data = await res.json();
    if (!data?.success || !Array.isArray(data.data))
      throw new Error('Invalid sub-districts payload');
    return data.data;
  },
};

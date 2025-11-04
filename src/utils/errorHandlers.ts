export const isKYCRequiredError = (error: any): boolean => {
  return error?.data?.code === 'kyc_required';
};

export const getErrorMessage = (error: any): string => {
  return error?.data?.message || error?.message || 'An error occurred';
};

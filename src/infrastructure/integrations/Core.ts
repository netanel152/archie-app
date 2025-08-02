export const UploadFile = async (data: any) => {
  console.log("Uploading file:", data);
  return { file_url: "https://example.com/receipt.jpg" };
};

export const InvokeLLM = async (data: any) => {
  console.log("Invoking LLM with:", data);
  return {
    product_name: "Sample Product",
    product_model: "ABC-123",
    store_name: "Sample Store",
    purchase_date: "2025-07-31",
    total_price: 123.45,
    currency: "USD",
    warranty_period: "1 year",
  };
};
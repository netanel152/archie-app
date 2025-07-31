export interface ItemData {
  id: string;
  product_name: string;
  product_model?: string;
  store_name?: string;
  purchase_date?: string;
  total_price?: number;
  currency?: string;
  warranty_period?: string;
  warranty_expiration_date?: string;
  category?: string;
  receipt_image_url?: string;
  manual_url?: string;
  user_notes?: string;
  processing_status: "processing" | "completed" | "failed";
  market_value?: number;
  market_value_last_updated?: string;
  serial_number?: string;
  condition?: "excellent" | "good" | "fair" | "poor";
  tags?: string[];
  is_archived?: boolean;
}

export class Item {
  static list = async (sort?: string): Promise<ItemData[]> => {
    console.log("Listing items with sort:", sort);
    return [
      {
        id: "1",
        product_name: "Example Item 1",
        purchase_date: "2025-07-30",
        total_price: 100,
        currency: "USD",
        category: "Electronics",
        processing_status: "completed",
      },
      {
        id: "2",
        product_name: "Example Item 2",
        purchase_date: "2025-07-29",
        total_price: 200,
        currency: "USD",
        category: "Appliances",
        processing_status: "completed",
      },
    ];
  };

  static create = async (data: Partial<ItemData>): Promise<ItemData> => {
    const newItem: ItemData = {
      id: Math.random().toString(36).substring(7),
      product_name: "Unknown Product",
      processing_status: "processing",
      ...data,
    };
    console.log("Creating item:", newItem);
    return newItem;
  };

  static update = async (id: string, data: Partial<ItemData>): Promise<void> => {
    console.log(`Updating item ${id} with:`, data);
    return;
  };
}
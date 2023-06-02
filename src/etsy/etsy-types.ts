interface Price{
    amount: number; // The amount of represented by this data.
    divisor: number; // >= 0 The divisor to render the amount.
    currency_code: string // The ISO currency code for this data.
}

interface Listing {
    listing_id: number; // must be >= 1
    user_id: number; // must be >= 1
    shop_id: number; // must be >= 1
    title: string;
    description: string;
    state: 'active' | 'inactive' | 'sold_out' | 'draft' | 'expired';
    creation_timestamp: number; // must be >= 946684800
    created_timestamp: number; // must be >= 946684800
    ending_timestamp: number; // must be >= 946684800
    original_creation_timestamp: number; // must be >= 946684800
    last_modified_timestamp: number; // must be >= 946684800
    updated_timestamp: number; // must be >= 946684800
    state_timestamp: number; // must be >= 946684800
    quantity: number; // must be >= 0
    shop_section_id: number | null; // must be >= 1 or null
    featured_rank: number;
    url: string;
    num_favorers: number; // must be >= 0
    non_taxable: boolean;
    is_taxable: boolean;
    is_customizable: boolean;
    is_personalizable: boolean | null;
    personalization_is_required: boolean | null;
    personalization_char_count_max: number | null;
    personalization_instructions: string | null;
    listing_type: 'physical' | 'download' | 'both';
    tags: string[];
    materials: string[];
    shipping_profile_id: number | null; // must be >= 1 or null
    return_policy_id: number | null; // must be >= 1 or null
    processing_min: number | null; // must be >= 0 or null
    processing_max: number | null; // must be >= 0 or null
    who_made: 'i_did' | 'someone_else' | 'collective' | null;
    when_made: 'made_to_order' | '2020_2023' | '2010_2019' | '2004_2009' | 'before_2004' | '2000_2003' | '1990s' | '1980s' | '1970s' | '1960s' | '1950s' | '1940s' | '1930s' | '1920s' | '1910s' | '1900s' | '1800s' | '1700s' | 'before_1700' | null;
    is_supply: boolean | null;
    item_weight: number | null; // must be a float number or null
    item_weight_unit: 'oz' | 'lb' | 'g' | 'kg' | null;
    item_length: number | null; // must be a float number or null
    item_width: number | null; // must be a float number or null
    item_height: number | null; // must be a float number or null
    item_dimensions_unit: 'in' | 'ft' | 'mm' | 'cm' | 'm' | 'yd' | 'inches' | null;
    is_private: boolean;
    style: string[] | null;
    file_data: string;
    has_variations: boolean;
    should_auto_renew: boolean;
    language: string | null;
    price: Price;
    taxonomy_id: number | null;
}


interface findAllActiveListingsByShopRequest {
    limit?: number; // [ 1 .. 100 ], default is 25
    sort_on?: 'created' | 'price' | 'updated' | 'score'; // default is "created"
    sort_order?: 'asc' | 'ascending' | 'desc' | 'descending' | 'up' | 'down'; // default is "desc"
    offset?: number; // >= 0, default is 0
    keywords?: string; // default is null
}

interface findAllActiveListingsByShopResponse {
    count: number;
    results: Listing[];
}
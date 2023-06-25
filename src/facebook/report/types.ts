

interface FbrTimeRange {
    since: string;
    until: string;
}


interface FbrAdAccount {
    id: string;
    account_id: string;
    account_status: number;
    //   ad_account_promotable_objects: AdAccountPromotableObjects;
    age: number;
    //   agency_client_declaration: AgencyClientDeclaration;
    amount_spent: string;
    //   attribution_spec: AttributionSpec[];
    balance: string;
    //   business: Business;
    business_city: string;
    business_country_code: string;
    business_name: string;
    business_state: string;
    business_street: string;
    business_street2: string;
    business_zip: string;
    can_create_brand_lift_study: boolean;
    capabilities: string[];
    created_time: Date;
    currency: string;
    direct_deals_tos_accepted: boolean;
    disable_reason: number;
    end_advertiser: string;
    end_advertiser_name: string;
    existing_customers: string[];
    //   extended_credit_invoice_group: ExtendedCreditInvoiceGroup;
    //   failed_delivery_checks: DeliveryCheck[];
    fb_entity: number;
    funding_source: string;
    // funding_source_details: FundingSourceDetails;
    has_migrated_permissions: boolean;
    has_page_authorized_adaccount: boolean;
    io_number: string;
    is_attribution_spec_system_default: boolean;
    is_direct_deals_enabled: boolean;
    is_in_3ds_authorization_enabled_market: boolean;
    is_notifications_enabled: boolean;
    is_personal: number;
    is_prepay_account: boolean;
    is_tax_id_required: boolean;
    line_numbers: number[];
    media_agency: string;
    min_campaign_group_spend_cap: string;
    min_daily_budget: number;
    name: string;
    offsite_pixels_tos_accepted: boolean;
    owner: string;
    partner: string;
    // rf_spec: ReachFrequencySpec;
    show_checkout_experience: boolean;
    spend_cap: string;
    tax_id: string;
    tax_id_status: number;
    tax_id_type: string;
    timezone_id: number;
    timezone_name: string;
    timezone_offset_hours_utc: number;
    tos_accepted: { [key: string]: number };
    user_tasks: string[];
    user_tos_accepted: { [key: string]: number };
}

interface FbrAdLabel {
    id: string; // Numeric string, Ad Label ID
    account: FbrAdAccount; // Ad Account
    created_time: Date; // Created time
    name: string; // Ad Label name
    updated_time: Date; // Updated time
}



// キャンペーンのパラメータ
interface FbrCampaignParameters {
    date_preset: 'today' | 'yesterday' | 'this_month' | 'last_month' | 'this_quarter' | 'maximum' | 'data_maximum' | 'last_3d' | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' | 'last_90d' | 'last_week_mon_sun' | 'last_week_sun_sat' | 'last_quarter' | 'last_year' | 'this_week_mon_today' | 'this_week_sun_today' | 'this_year';
    effective_status: ('ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED' | 'PENDING_BILLING_INFO' | 'CAMPAIGN_PAUSED' | 'ARCHIVED' | 'ADSET_PAUSED' | 'IN_PROCESS' | 'WITH_ISSUES')[];
    is_completed: boolean;
    time_range: FbrTimeRange;
}

// キャンペーンのデータ
interface FbrCampaignNode {
    id: string;
    account_id: string;
    adlabels: FbrAdLabel[];
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP' | 'COST_CAP';
    boosted_object_id?: string;
    // brand_lift_studies: AdStudy[];
    budget_rebalance_flag?: boolean;
    budget_remaining: string;
    buying_type: 'AUCTION' | 'RESERVED';
    can_create_brand_lift_study: boolean;
    can_use_spend_cap: boolean;
    configured_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
    created_time: Date;
    daily_budget: string;
    effective_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'IN_PROCESS' | 'WITH_ISSUES';
    has_secondary_skadnetwork_reporting?: boolean;
    is_skadnetwork_attribution?: boolean;
    // issues_info?: AdCampaignIssuesInfo[];
    last_budget_toggling_time?: Date;
    lifetime_budget: string;
    name: string;
    objective: string;
    pacing_type: string[];
    primary_attribution?: any; // Replace with proper enum type if available
    // promoted_object: AdPromotedObject;
    // recommendations?: AdRecommendation[];
    smart_promotion_type?: any; // Replace with proper enum type if available
    // source_campaign?: Campaign;
    source_campaign_id?: string;
    special_ad_categories?: any[]; // Replace with proper enum type if available
    special_ad_category?: any; // Replace with proper enum type if available
    special_ad_category_country?: any[]; // Replace with proper enum type if available
    spend_cap: string;
    start_time: Date;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
    stop_time?: Date;
    topline_id?: string;
    updated_time: Date;
}



type FbrActionAttributionWindowsEnum = '1d_view' | '7d_view' | '28d_view' | '1d_click' | '7d_click' | '28d_click' | 'dda' | 'default' | 'skan_view' | 'skan_click';
type FbrActionBreakdownsEnum = 'action_device' | 'standard_event_content_type' | 'action_canvas_component_name' | 'action_carousel_card_id' | 'action_carousel_card_name' | 'action_destination' | 'action_reaction' | 'action_target_id' | 'action_type' | 'action_video_sound' | 'action_video_type';
type FbrActionReportTimeEnum = 'impression' | 'conversion' | 'mixed';
type FbrBreakdownsEnum = 'ad_format_asset' | 'age' | 'app_id' | 'body_asset' | 'call_to_action_asset' | 'coarse_conversion_value' | 'country' | 'description_asset' | 'fidelity_type' | 'gender' | 'hsid' | 'image_asset' | 'impression_device' | 'is_conversion_id_modeled' | 'link_url_asset' | 'postback_sequence_index' | 'product_id' | 'redownload' | 'region' | 'skan_campaign_id' | 'skan_conversion_id' | 'skan_version' | 'title_asset' | 'video_asset' | 'dma' | 'frequency_value' | 'hourly_stats_aggregated_by_advertiser_time_zone' | 'hourly_stats_aggregated_by_audience_time_zone' | 'mmm' | 'place_page_id' | 'publisher_platform' | 'platform_position' | 'device_platform';
type FbrDatePresetEnum = 'today' | 'yesterday' | 'this_month' | 'last_month' | 'this_quarter' | 'maximum' | 'data_maximum' | 'last_3d' | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' | 'last_90d' | 'last_week_mon_sun' | 'last_week_sun_sat' | 'last_quarter' | 'last_year' | 'this_week_mon_today' | 'this_week_sun_today' | 'this_year';
type FbrLevelEnum = 'ad' | 'adset' | 'campaign' | 'account';
type FbrTimeIncrementEnum = 'monthly' | 'all_days' | number;

interface FbrFilterObject {
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'IN_RANGE' | 'NOT_IN_RANGE' | 'CONTAIN' | 'NOT_CONTAIN' | 'IN' | 'NOT_IN' | 'STARTS_WITH' | 'ENDS_WITH' | 'ANY' | 'ALL' | 'AFTER' | 'BEFORE' | 'ON_OR_AFTER' | 'ON_OR_BEFORE' | 'NONE' | 'TOP';
    value: string;
}

interface FbrAdsInsightsDdaResult {
    // Define the properties of AdsInsightsDdaResult
}

interface FbrAdsHistogramStats {
    // Define the properties of AdsHistogramStats
}
interface FbrActionStats {
    '1d_click': string;
    '1d_ev': string;
    '1d_view': string;
    '28d_click': string;
    '28d_view': string;
    '7d_click': string;
    '7d_view': string;
    action_canvas_component_name: string;
    action_carousel_card_id: string;
    action_carousel_card_name: string;
    action_destination: string;
    action_device: string;
    action_reaction: string;
    action_target_id: string;
    action_type: string;
    action_video_sound: string;
    action_video_type: string;
    dda: string;
    inline: string;
    value: string;
}


// レポート生成時のパラメータ
interface FbrCreateReportParameters {
    action_attribution_windows?: FbrActionAttributionWindowsEnum[];
    action_breakdowns?: FbrActionBreakdownsEnum[];
    action_report_time?: FbrActionReportTimeEnum;
    breakdowns?: FbrBreakdownsEnum[];
    date_preset?: FbrDatePresetEnum;
    default_summary?: boolean;
    export_columns?: string[];
    export_format?: string;
    export_name?: string;
    fields?: string[];
    filtering?: FbrFilterObject[];
    level?: FbrLevelEnum;
    product_id_limit?: number;
    sort?: string[];
    summary?: string[];
    summary_action_breakdowns?: FbrActionBreakdownsEnum[];
    time_increment?: FbrTimeIncrementEnum;
    time_range?: FbrTimeRange;
    time_ranges?: FbrTimeRange;
    use_account_attribution_setting?: boolean;
    use_unified_attribution_setting?: boolean;
}

// レポート読み込み時のパラメータ
interface FbrReportParameters {
    action_attribution_windows: FbrActionAttributionWindowsEnum[]; // Default: ['default']
    action_breakdowns: FbrActionBreakdownsEnum[]; // Default: ['action_type']
    action_report_time: FbrActionReportTimeEnum;
    breakdowns: FbrBreakdownsEnum[];
    date_preset: FbrDatePresetEnum; // Default: 'last_30d'
    default_summary: boolean; // Default: false
    export_columns: string[];
    export_format: string;
    export_name: string;
    fields: string[];
    filtering: FbrFilterObject; // Default: []
    level: FbrLevelEnum;
    product_id_limit: number;
    sort: string[]; // Default: []
    summary: string[];
    summary_action_breakdowns: FbrActionBreakdownsEnum[]; // Default: ['action_type']
    time_increment: FbrTimeIncrementEnum; // Default: 'all_days'
    time_range: FbrTimeRange;
    time_ranges: FbrTimeRange;
    use_account_attribution_setting: boolean; // Default: false
    use_unified_attribution_setting: boolean;
}

// レポートのデータ
interface FbrInsightsNode {
    account_currency: string;
    account_id: string;
    account_name?: string;
    action_values: FbrActionStats[];
    actions: FbrActionStats[];
    ad_id: string;
    ad_name?: string;
    adset_id: string;
    adset_name?: string;
    app_id: string;
    attribution_setting: string;
    buying_type: string;
    campaign_id: string;
    campaign_name?: string;
    canvas_avg_view_percent: string;
    canvas_avg_view_time: string;
    catalog_segment_value: FbrActionStats[];
    clicks: string;
    coarse_conversion_value: string;
    conversion_rate_ranking: string;
    conversion_values: FbrActionStats[];
    conversions: FbrActionStats[];
    converted_product_quantity: FbrActionStats[];
    converted_product_value: FbrActionStats[];
    cost_per_action_type: FbrActionStats[];
    cost_per_conversion: FbrActionStats[];
    cost_per_estimated_ad_recallers: string;
    cost_per_inline_link_click: string;
    cost_per_inline_post_engagement: string;
    cost_per_outbound_click: FbrActionStats[];
    cost_per_thruplay: FbrActionStats[];
    cost_per_unique_action_type: FbrActionStats[];
    cost_per_unique_click: string;
    cost_per_unique_inline_link_click: string;
    cost_per_unique_outbound_click: FbrActionStats[];
    cpc: string;
    cpm: string;
    cpp: string;
    ctr: string;
    date_start: string;
    date_stop: string;
    dda_results: FbrAdsInsightsDdaResult[];
    engagement_rate_ranking: string;
    estimated_ad_recall_rate: string;
    estimated_ad_recallers: string;
    fidelity_type: string;
    frequency: string;
    full_view_impressions: string;
    full_view_reach: string;
    hsid: string;
    impressions: string;
    inline_link_click_ctr: string;
    inline_link_clicks: string;
    inline_post_engagement: string;
    instagram_upcoming_event_reminders_set: string;
    instant_experience_clicks_to_open: string;
    instant_experience_clicks_to_start: string;
    instant_experience_outbound_clicks: FbrActionStats[];
    is_conversion_id_modeled: string;
    mobile_app_purchase_roas: FbrActionStats[];
    objective: string;
    optimization_goal: string;
    outbound_clicks: FbrActionStats[];
    outbound_clicks_ctr: FbrActionStats[];
    place_page_name: string;
    postback_sequence_index: string;
    purchase_roas: FbrActionStats[];
    qualifying_question_qualify_answer_rate: string;
    quality_ranking: string;
    reach: string;
    redownload: string;
    skan_campaign_id: string;
    skan_conversion_id: string;
    skan_version: string;
    social_spend: string;
    spend: string;
    total_postbacks: string;
    total_postbacks_detailed: FbrActionStats[];
    user_segment_key: string;
    video_30_sec_watched_actions: FbrActionStats[];
    video_avg_time_watched_actions: FbrActionStats[];
    video_p100_watched_actions: FbrActionStats[];
    video_p25_watched_actions: FbrActionStats[];
    video_p50_watched_actions: FbrActionStats[];
    video_p75_watched_actions: FbrActionStats[];
    video_p95_watched_actions: FbrActionStats[];
    video_play_actions: FbrActionStats[];
    video_play_curve_actions: FbrAdsHistogramStats[];
    website_ctr: FbrActionStats[];
    website_purchase_roas: FbrActionStats[];
}


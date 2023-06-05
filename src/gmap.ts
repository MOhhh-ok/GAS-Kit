type GMapBasicFields =
    | 'address_components'
    | 'adr_address'
    | 'business_status'
    | 'formatted_address'
    | 'geometry'
    | 'icon'
    | 'icon_mask_base_uri'
    | 'icon_background_color'
    | 'name'
    | 'photo'
    | 'place_id'
    | 'plus_code'
    | 'type'
    | 'url'
    | 'utc_offset'
    | 'vicinity'
    | 'wheelchair_accessible_entrance';

type GMapContactFields =
    | 'current_opening_hours'
    | 'formatted_phone_number'
    | 'international_phone_number'
    | 'opening_hours'
    | 'secondary_opening_hours'
    | 'website';

type GMapAtmosphereFields =
    | 'curbside_pickup'
    | 'delivery'
    | 'dine_in'
    | 'editorial_summary'
    | 'price_level'
    | 'rating'
    | 'reservable'
    | 'reviews'
    | 'serves_beer'
    | 'serves_breakfast'
    | 'serves_brunch'
    | 'serves_dinner'
    | 'serves_lunch'
    | 'serves_vegetarian_food'
    | 'serves_wine'
    | 'takeout'
    | 'user_ratings_total';

type GMapAllFields = GMapBasicFields | GMapContactFields | GMapAtmosphereFields;

class GMap {

    cmbParams(p: {}) {
        return Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    }

    request(path: string, params: {}) {
        const prop = PropertiesService.getScriptProperties();
        const newParams = Object.assign(params, {
            key: prop.getProperty('GMAP_API_KEY'),
        })
        const url = path + '/json?' + this.cmbParams(newParams);
        console.log(url);
        const res = UrlFetchApp.fetch(url, {
            method: 'get',
        });
        const txt = res.getContentText();
        console.log(txt);
        return txt;
    }

    /**
     * Basic fields: address_components, adr_address, business_status, formatted_address, geometry, icon, icon_mask_base_uri, icon_background_color, name, permanently_closed (deprecated), photo, place_id, plus_code, type, url, utc_offset, vicinity, wheelchair_accessible_entrance.
     * Contact: current_opening_hours, formatted_phone_number, international_phone_number, opening_hours, secondary_opening_hours, website
     * Atmosphere: curbside_pickup, delivery, dine_in, editorial_summary, price_level, rating, reservable, reviews, serves_beer, serves_breakfast, serves_brunch, serves_dinner, serves_lunch, serves_vegetarian_food, serves_wine, takeout, user_ratings_total.
     */
    findPlace(input: string, fields: GMapAllFields[]) {
        fields = ['name'];
        const params = {
            input: input,
            fields: fields.join(','),
            inputtype: 'textquery',
        };
        const test = this.request('https://maps.googleapis.com/maps/api/place/findplacefromtext', params);
    }

    textSearch(q: string) {
        const params = {
            query: q,
        }
        const ret = this.request('https://maps.googleapis.com/maps/api/place/textsearch', params);
    }
}

function myFunction() {
    const test = new GMap();
    test.textSearch('東京都 レストラン');
}

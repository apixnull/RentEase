// services/api/landlord.api.ts

import authApiClient from "../authApiClient";


/**
 * ============================================================
 * 🔐 Protected APIs — Access token required
 * ============================================================
 */


export const getPropertiesRequest = () => {
    return authApiClient.get("/landlord/property/properties");
};

export const getPropertiesDetailsRequest = (id: string) => {
    return authApiClient.get(`/landlord/property/${id}`);
}

export const addPropertyRequest = (data: any) => {
    return authApiClient.post("/landlord/property/add-property", data, {
        headers: {
            "Content-Type": "application/json",
        },
    });
};

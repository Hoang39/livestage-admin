export const commonParams = (requestId: string, params: unknown) => {
    return {
        JSON: JSON.stringify({
            ROWS: [
                {
                    REQUEST_ID: requestId,
                    PARAMETER: params,
                },
            ],
        }),
    };
};

export const commonArrParams = (requestId: string, params: any) => {
    return {
        JSON: JSON.stringify({
            ROWS: params.map((param: any) => ({
                REQUEST_ID: requestId,
                PARAMETER: param,
            })),
        }),
    };
};

export const liveParams = (params: unknown) => {
    return {
        JSON: JSON.stringify(params),
    };
};

import { baseUrl } from '@/constants/systemconstant';
import { loginResponse } from '@/models/apimodel';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const accountApi = createApi({
    reducerPath: 'accountApi',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
        headers: {
            'content-type': 'application/json'
        }
    }),
    endpoints: (builder) => ({
        // 'getPosts' is a 'query' endpoint for fetching data
        login: builder.mutation<loginResponse, { token: string; strUserId: string }>({
            query: body => ({
                url: 'api/getusers',
                method: 'POST',
                body
            }),
        }),
    }),
});

// RTK Query automatically generates React hooks based on your endpoints
// The hook is named `use<EndpointName>Query`
export const { useLoginMutation } = accountApi;
import { baseApi } from "@/api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // create book
    // POST /api/products
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    //get products with pagination, sorting and filtering
    getProducts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            searchParams.set(key, val);
          }
        });
        return `/products?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Product", id: _id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    // get product by id
    // GET /api/products/:identifier
    getProductById: builder.query({
      query: (identifier) => `/products/${identifier}`,
      providesTags: (result, error, identifier) => [
        { type: "Product", id: identifier },
      ],
    }),

    // PATCH /api/products/:id
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // updateBook: builder.mutation({
    //   query: ({ id, data }) => ({
    //     url: `/product/update/${id}`,
    //     method: "PATCH",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Products"], // Invalidate the 'Products' tag to refetch data
    // }),

    //delete book by id

    // DELETE /api/products/:id
    deleteProduct: builder.mutation({
      query: (arg) => {
        if (Array.isArray(arg)) {
          return {
            url: `/products/delete`,
            method: "DELETE",
            body: { ids: arg },
          };
        }

        return {
          url: `/products/delete/${arg}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // DELETE /api/products/bulk  — body: { ids: [...] }
    deleteMultipleProducts: builder.mutation({
      query: (ids) => ({
        url: "/products/delete",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteMultipleProductsMutation,
} = productApi;

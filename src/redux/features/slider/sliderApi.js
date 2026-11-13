import { baseApi } from '../baseApi';

const sliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create or Update Slider
    createOrUpdateSlider: builder.mutation({
      query: (formData) => ({
        url: 'hero/create/slider',
        method: 'POST',
        body: formData,
      }),
    }),

    // get all sliders img
    getAllSliders: builder.query({
      query: () => ({
        url: 'hero/get/sliders',
      }), // Adjust the URL path as necessary

      providesTags: ['Sliders'],
    }),

    // update sliders
    updateSliders: builder.mutation({
      query: ({ id, formData }) => ({
        url: `hero/update/slider/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Sliders'],
    }),

    // delete sliders
    deleteSliders: builder.mutation({
      query: (ids) => ({
        url: 'hero/delete/slider',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Sliders'],
    }),

    // post gallery images
    uploadGalleryImages: builder.mutation({
      query: (formData) => ({
        url: 'gallery/upload-multiple/images',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery'],
    }),

    // get all gallery images
    getGalleryImages: builder.query({
      query: () => '/gallery/images/all',
      providesTags: ['Gallery'],
    }),

    //update gallery imgs
    updateGalleryImages: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/gallery/images/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Gallery'],
    }),
    // delete gallery images
    deleteGalleryImages: builder.mutation({
      query: (ids) => ({
        url: '/gallery/images/delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Gallery'],
    }),
  }),
});

export const {
  //slider
  useCreateOrUpdateSliderMutation,
  useGetAllSlidersQuery,
  useUpdateSlidersMutation,
  useDeleteSlidersMutation,
  //gallery
  useUploadGalleryImagesMutation,
  useGetGalleryImagesQuery,
  useUpdateGalleryImagesMutation,
  useDeleteGalleryImagesMutation,
} = sliderApi;

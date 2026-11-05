import React, { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  Globe,
  MapPin,
  BookOpen,
  Store,
  Truck,
  Save,
  Plus,
  ChevronRight,
  HelpCircle,
  MoreHorizontal,
  List,
  RefreshCcw,
  Trash2,
  Phone,
  Settings,
  Type,
} from 'lucide-react';

import toast from 'react-hot-toast';
import {
  useCreateShippingMutation,
  useDeleteShippingMutation,
  useGetShippingSettingsQuery,
  useUpdateShippingSettingsMutation,
} from '../services/shippingApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';

const Shipping = () => {
  // 1. RTK Query hooks
  const { data: response, isLoading, refetch } = useGetShippingSettingsQuery();

  const initialData = response?.data || response;

  const [createShipping, { isLoading: isCreating }] =
    useCreateShippingMutation();
  const [updateShipping, { isLoading: isUpdating }] =
    useUpdateShippingSettingsMutation();

  const [deleteShipping, { isLoading: isDeleting }] =
    useDeleteShippingMutation();

  // 2. React Hook Form Initialization
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      deliveryArea: {
        inside: { name: 'Gazipur', charge: 70 },
        outside: { name: 'Outside Gazipur', charge: 120 },
      },
      bookShipping: { fixedCharge: 60, coverage: 'All Bangladesh' },
      pickupStore: { enabled: true, phone: '', location: '', instruction: '' },
      courier: { name: 'Steadfast' },
    },
  });

  const insideCustom = useFieldArray({
    control,
    name: 'deliveryArea.inside.customFields',
  });
  const outsideCustom = useFieldArray({
    control,
    name: 'deliveryArea.outside.customFields',
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Watch for "Self Pickup" toggle
  const isPickupEnabled = useWatch({ control, name: 'pickupStore.enabled' });

  // 3. Handle Create or Update
  // const onFormSubmit = async (formData) => {
  //   try {
  //     if (initialData?._id) {
  //       await updateShipping({ id: initialData._id, ...formData }).unwrap();
  //       toast.success("Settings updated successfully");
  //     } else {
  //       await createShipping(formData).unwrap();
  //       toast.success("Shipping configuration created");
  //     }
  //     refetch();
  //   } catch (err) {
  //     toast.error(err?.data?.message || "Action failed");
  //   }
  // };

  const onFormSubmit = async (data) => {
    const processFields = (zone) => {
      const obj = { ...zone };
      if (zone.customFields) {
        zone.customFields.forEach((field) => {
          if (field.key) {
            obj[field.key] =
              !isNaN(field.value) && field.value !== ''
                ? Number(field.value)
                : field.value;
          }
        });
        delete obj.customFields;
      }
      return obj;
    };

    const finalData = {
      ...data,
      deliveryArea: {
        inside: processFields(data.deliveryArea.inside),
        outside: processFields(data.deliveryArea.outside),
      },
    };

    try {
      if (initialData?._id) {
        await updateShipping({ id: initialData._id, ...finalData }).unwrap();
      } else {
        await createShipping(finalData).unwrap();
      }
      toast.success('Saved successfully');
      refetch();
    } catch (err) {
      toast.error('Error saving data');
    }
  };

  // 4. Handle Delete/Reset
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to reset shipping settings?')) {
      try {
        await deleteShipping(initialData._id).unwrap();
        toast.success('Settings reset to default');
        refetch();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  // Reusable Custom Field Component
  const CustomFieldSection = ({ fields, append, remove, registerPath }) => (
    <div className="pt-4 mt-6 space-y-3 border-t border-gray-200 border-dashed">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Custom Attributes
        </span>
        <button
          type="button"
          onClick={() => append({ key: '', value: '' })}
          className="text-gray-400 hover:text-green-600"
        >
          <Plus size={14} />
        </button>
      </div>
      {fields?.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Settings
              className="absolute left-2 top-2.5 text-gray-300"
              size={10}
            />
            <input
              placeholder="Property"
              {...register(`${registerPath}.${index}.key`)}
              className="w-full pl-6 pr-2 py-2 text-[11px] border border-[#edece9] rounded-lg outline-none focus:border-blue-300"
            />
          </div>
          <div className="relative flex-1">
            <Type className="absolute left-2 top-2.5 text-gray-300" size={10} />
            <input
              placeholder="Value"
              {...register(`${registerPath}.${index}.value`)}
              className="w-full pl-6 pr-2 py-2 text-[11px] border border-[#edece9] rounded-lg outline-none focus:border-blue-300"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-gray-300 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 font-cocon animate-pulse">
        Please wait...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-[#37352f] flex flex-col selection:bg-blue-100">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[#edece9] px-4 py-3 flex items-center justify-between">
        <BreadCrumbMenu />
      </header>

      <main className="flex flex-col flex-1 overflow-hidden lg:flex-row">
        {/* Left Side: Form */}
        <div className="w-full lg:w-[45%] border-r border-[#edece9] overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar">
          <div className="max-w-xl mx-auto">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              {initialData ? 'Edit Logistics' : 'Setup Shipping'}
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              Update your delivery rates and regional configuration. These
              changes affect checkout calculations.
            </p>

            <form className="space-y-8" onSubmit={handleSubmit(onFormSubmit)}>
              {/* Delivery Zone Section */}
              <section className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                  <Globe size={14} /> Area Pricing
                </label>

                <div className="space-y-4 bg-[#f7f6f3] p-5 rounded-xl border border-[#edece9]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">
                        Inside Name
                      </span>
                      <input
                        {...register('deliveryArea.inside.name')}
                        className="w-full bg-white border border-[#edece9] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">
                        Inside Charge
                      </span>
                      <input
                        type="number"
                        {...register('deliveryArea.inside.charge')}
                        className="w-full bg-white border border-[#edece9] rounded-md px-3 py-2 text-sm font-mono outline-none"
                      />
                    </div>
                  </div>
                  <CustomFieldSection
                    fields={insideCustom.fields}
                    append={insideCustom.append}
                    remove={insideCustom.remove}
                    registerPath="deliveryArea.inside.customFields"
                  />
                  <div className="grid grid-cols-2 gap-4 border-t border-[#edece9] pt-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-orange-500 uppercase">
                        Outside Name
                      </span>
                      <input
                        {...register('deliveryArea.outside.name')}
                        className="w-full bg-white border border-[#edece9] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-orange-500 uppercase">
                        Outside Charge
                      </span>
                      <input
                        type="number"
                        {...register('deliveryArea.outside.charge')}
                        className="w-full bg-white border border-[#edece9] rounded-md px-3 py-2 text-sm font-mono outline-none"
                      />
                    </div>
                  </div>

                  <CustomFieldSection
                    fields={outsideCustom.fields}
                    append={outsideCustom.append}
                    remove={outsideCustom.remove}
                    registerPath="deliveryArea.inside.customFields"
                  />
                </div>
              </section>

              {/* Specialty & Courier */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <section className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    <BookOpen size={14} /> Book Rate
                  </label>
                  <div className="p-4 border border-[#edece9] rounded-xl bg-white shadow-sm space-y-3">
                    <input
                      type="number"
                      placeholder="Charge"
                      {...register('bookShipping.fixedCharge')}
                      className="w-full pb-1 text-sm border-b border-transparent outline-none focus:border-blue-400"
                    />
                    <input
                      placeholder="Coverage"
                      {...register('bookShipping.coverage')}
                      className="w-full text-xs text-gray-400 border-b border-transparent outline-none focus:border-blue-400"
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    <Truck size={14} /> Courier
                  </label>
                  <div className="p-4 border border-[#edece9] rounded-xl bg-white shadow-sm">
                    <input
                      placeholder="Partner Name"
                      {...register('courier.name')}
                      className="w-full pb-1 text-sm font-medium border-b border-transparent outline-none focus:border-blue-400"
                    />
                  </div>
                </section>
              </div>

              {/* Pickup Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#edece9] pb-2">
                  <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    <Store size={14} /> Self Pickup
                  </label>
                  <div
                    onClick={() =>
                      reset({
                        ...control._formValues,
                        pickupStore: {
                          ...control._formValues.pickupStore,
                          enabled: !isPickupEnabled,
                        },
                      })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isPickupEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isPickupEnabled ? 'translate-x-5' : ''}`}
                    />
                    <input
                      type="checkbox"
                      {...register('pickupStore.enabled')}
                      className="hidden"
                    />
                  </div>
                </div>

                {isPickupEnabled && (
                  <div className="space-y-4 p-5 bg-gray-50/50 border border-[#edece9] rounded-xl animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-gray-400" />
                      <input
                        placeholder="Store Address"
                        {...register('pickupStore.location')}
                        className="w-full py-1 text-sm bg-transparent border-b border-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-gray-400" />
                      <input
                        placeholder="Contact Phone"
                        {...register('pickupStore.phone')}
                        className="w-full py-1 text-sm bg-transparent border-b border-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-gray-400" />
                      <input
                        placeholder="instruction"
                        {...register('pickupStore.instruction')}
                        className="w-full py-1 text-sm bg-transparent border-b border-gray-200 outline-none"
                      />
                    </div>
                  </div>
                )}
              </section>

              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full bg-[#37352f] text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isCreating || isUpdating ? (
                  <RefreshCcw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {initialData ? 'Update Changes' : 'Create Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Database View */}
        <div className="w-full lg:w-[55%] bg-[#fcfaf8]/50 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <List size={20} className="text-gray-400" />
                Live Logistics
              </h2>
              <div className="flex items-center gap-2">
                {initialData && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 transition-all rounded-md hover:text-red-500 hover:bg-red-50"
                    title="Reset Settings"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#edece9] rounded-md shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#edece9] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-4 py-3 border-r border-[#edece9]">
                      Category
                    </th>
                    <th className="px-4 py-3 border-r border-[#edece9]">
                      Metric
                    </th>
                    <th className="px-4 py-3">Current Value</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {/* Inside */}
                  <tr className="border-b border-[#edece9] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-[#edece9] font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {initialData?.deliveryArea?.inside?.name || 'Inside'}
                    </td>
                    <td className="px-4 py-3 border-r border-[#edece9] text-gray-400 italic">
                      Delivery Charge
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      {initialData?.deliveryArea?.inside?.charge ?? '--'} BDT
                    </td>
                  </tr>
                  {/* Outside */}
                  <tr className="border-b border-[#edece9] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-[#edece9] font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      {initialData?.deliveryArea?.outside?.name || 'Outside'}
                    </td>
                    <td className="px-4 py-3 border-r border-[#edece9] text-gray-400 italic">
                      Delivery Charge
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-orange-600">
                      {initialData?.deliveryArea?.outside?.charge ?? '--'} BDT
                    </td>
                  </tr>
                  {/* Books */}
                  <tr className="border-b border-[#edece9] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-[#edece9] font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />{' '}
                      Book Rate
                    </td>
                    <td className="px-4 py-3 border-r border-[#edece9] text-gray-400 italic">
                      Fixed Charge
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {initialData?.bookShipping?.fixedCharge ?? '--'} BDT
                    </td>
                  </tr>
                  {/* Pickup */}
                  <tr className="border-b border-[#edece9] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-[#edece9] font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />{' '}
                      Pickup Status
                    </td>
                    <td className="px-4 py-3 border-r border-[#edece9] text-gray-400 italic">
                      Availability
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${initialData?.pickupStore?.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {initialData?.pickupStore?.enabled
                          ? 'Active'
                          : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              {!initialData && (
                <div className="p-10 text-sm text-center text-gray-400">
                  No data found. Fill the form to initialize.
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 mt-8 border border-blue-100 bg-blue-50/30 rounded-xl">
              <HelpCircle className="text-blue-500 shrink-0" size={18} />
              <p className="text-[11px] leading-relaxed text-blue-700">
                <b>Editing Note:</b> To update any value, simply change it in
                the form and click &quot;Update Changes&quot;. The database
                table on this side will refresh immediately after a successful
                sync.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shipping;

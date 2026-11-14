import { useEffect, useRef } from 'react';

const ratePerSecond = 0.0277777778;

export default function UpdateNursingPopover({
  openPopover,
  onClose,
  popoverData,
}) {
  const modalRef = useRef(null);

  // Open modal when openPopover = true
  useEffect(() => {
    if (openPopover) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [openPopover]);

  return (
    <dialog id="update_nursing_popover" ref={modalRef} className="modal">
      <div className="max-w-lg modal-box w-96">
        <h3 className="text-lg font-bold">Update Nursing Duty</h3>

        {popoverData && (
          <p className="mb-3 text-sm text-gray-500">
            Editing Duty of:{' '}
            <span className="font-semibold">{popoverData?.employeeName}</span>
            <p className="font-semibold">{popoverData?._id}</p>
          </p>
        )}

        {/* INPUT FIELDS */}
        <div className="mt-4 space-y-3">
          <div className="grid items-center grid-cols-3 gap-4">
            <label>Date</label>
            <input
              value={popoverData?.date}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>

          <div className="grid items-center grid-cols-3 gap-4">
            <label>Mess Name</label>
            <input
              value={popoverData?.messName}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>

          <div className="grid items-center grid-cols-3 gap-4">
            <label>Duty Start</label>
            <input
              value={popoverData?.dutyStartTime}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>

          <div className="grid items-center grid-cols-3 gap-4">
            <label>Duty End</label>
            <input
              value={popoverData?.dutyEndTime}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>
          <div className="grid items-center grid-cols-3 gap-4">
            <label>Total Amount</label>
            <input
              value={popoverData?.totalAmount}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>
          <div className="grid items-center grid-cols-3 gap-4">
            <label>Status</label>
            <input
              value={popoverData?.status}
              className="col-span-2 input input-bordered input-sm"
            />
          </div>
        </div>

        {/* MODAL ACTIONS */}
        <div className="modal-action">
          <button
            className="btn btn-sm btn-error"
            onClick={() => {
              modalRef.current.close();
              onClose();
            }}
          >
            Close
          </button>

          <button className="btn btn-accent btn-sm">Update</button>
        </div>
      </div>

      {/* Clicking outside closes modal */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>Close</button>
      </form>
    </dialog>
  );
}

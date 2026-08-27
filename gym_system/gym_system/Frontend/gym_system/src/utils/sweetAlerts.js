import Swal from 'sweetalert2';

// Cylon Force Theme Colors
const themeConf = {
  background: '#1a1a1a',
  color: '#ffffff',
  confirmButtonColor: '#dc2626', // bg-red-600
  cancelButtonColor: '#374151', // bg-gray-700
  customClass: {
    popup: 'border border-gray-800 rounded-xl shadow-2xl',
    title: 'text-xl font-black italic uppercase tracking-widest',
    htmlContainer: 'text-gray-400 text-sm font-light',
    confirmButton: 'font-black text-[10px] tracking-widest px-8 py-3 rounded uppercase transition',
    cancelButton: 'font-black text-[10px] tracking-widest px-8 py-3 rounded uppercase transition',
  }
};

/**
 * Show a success alert
 */
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...themeConf,
    icon: 'success',
    title,
    text,
    iconColor: '#22c55e', // green-500
  });
};

/**
 * Show an error alert
 */
export const showError = (title, text = '') => {
  return Swal.fire({
    ...themeConf,
    icon: 'error',
    title,
    text,
    iconColor: '#dc2626', // red-600
  });
};

/**
 * Show a warning alert
 */
export const showWarning = (title, text = '') => {
  return Swal.fire({
    ...themeConf,
    icon: 'warning',
    title,
    text,
    iconColor: '#eab308', // yellow-500
    confirmButtonText: 'Understood'
  });
};

/**
 * Show a confirmation dialog
 * returns a Promise that resolves to true if confirmed, false otherwise
 */
export const showConfirm = async (title, text = 'You will not be able to recover this!') => {
  const result = await Swal.fire({
    ...themeConf,
    title,
    text,
    icon: 'warning',
    iconColor: '#eab308',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed!',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
};

/**
 * Show a loading alert
 */
export const showLoading = (title = 'Please wait...', text = 'Processing your request') => {
  Swal.fire({
    ...themeConf,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Show an input dialog (e.g. for bank slip ID)
 */
export const showInput = async (title, text, placeholder) => {
    const { value } = await Swal.fire({
        ...themeConf,
        title,
        text,
        input: 'text',
        inputPlaceholder: placeholder,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        inputValidator: (value) => {
            if (!value) {
                return 'This field is required!';
            }
        }
    });
    return value;
};

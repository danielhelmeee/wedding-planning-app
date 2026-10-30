// A wa.me link for a phone number, or null if it is too short to be one.
// Malaysian numbers written with a leading 0 get the 60 country code.
export function whatsappHref(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length < 9) return null
  return `https://wa.me/${digits.startsWith('0') ? `6${digits}` : digits}`
}

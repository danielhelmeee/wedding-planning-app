// A quiet "+ Add another …" line at the end of a list. The page's main add button lives in its header.
export default function AddLine({ label, onClick }) {
  return (
    <button type="button" className="add-line" onClick={onClick}>
      <span aria-hidden="true">+</span> {label}
    </button>
  )
}

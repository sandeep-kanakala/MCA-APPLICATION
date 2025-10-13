import './index.css';

const colors = ['#7C3AED', '#EC4899', '#FACC15', '#3B82F6'];

const Loader = () => (
  <div className="multichoise-loader">
    {colors.map((color, i) => (
      <div key={i} className="dot" style={{ backgroundColor: color }} />
    ))}
  </div>
);

export default Loader;

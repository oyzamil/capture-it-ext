import EdgeGradientMask from '../editor/components/BorderBox';

const Test = () => {
  const [matchParent, setMatchParent] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      <div className="mb-8 flex items-center gap-4">
        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input type="checkbox" checked={matchParent} onChange={(e) => setMatchParent(e.target.checked)} className="w-4 h-4" />
          <span>Match parent dimensions (overflow child)</span>
        </label>
      </div>

      <div className="p-16 bg-gray-800/50 rounded-xl aspect-video">
        <EdgeGradientMask gradientColor="rgba(59, 130, 246, 0.8)" matchParent={matchParent}>
          <div className="bg-gray-800 p-12 rounded-lg">
            <h1 className="text-4xl font-bold text-white mb-4">Edge Gradient Mask</h1>
            <p className="text-gray-300 max-w-md">Toggle the checkbox to switch between child dimensions (default) and parent dimensions that overflow the child.</p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Try Resizing</button>
          </div>
        </EdgeGradientMask>
      </div>
    </div>
  );
};

export default Test;

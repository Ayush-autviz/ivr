
const Loading = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
     
    </div>
  );
};

export default Loading;

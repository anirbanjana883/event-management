import { useParams } from 'react-router-dom';

const EventDetails = () => {
  const { id } = useParams();
  return <div className="p-10 text-center text-2xl font-bold">Details for Event ID: {id} 🔍</div>;
};
export default EventDetails;
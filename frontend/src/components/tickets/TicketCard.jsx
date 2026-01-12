import React from 'react';

const TicketCard = ({ ticket, onClick }) => {
  const { event, status, createdAt } = ticket;
  const eventDate = new Date(event.date);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100"
    >
      {/* Event Image Banner (Optional) */}
      <div className="h-32 bg-indigo-600 relative">
          {/* You can add an actual image here if your Event model has one */}
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-white font-bold text-xl opacity-50">{event.title}</span>
          </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800 truncate">{event.title}</h3>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
                {status.toUpperCase()}
            </span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
            {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>

        <div className="border-t pt-3 flex justify-between items-center text-sm text-gray-400">
             <span>Purchased on {new Date(createdAt).toLocaleDateString()}</span>
             <span className="text-indigo-600 font-semibold">View Ticket &rarr;</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
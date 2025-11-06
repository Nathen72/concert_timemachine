import type { Concert } from '../types';

export const VenueInfo = ({ concert }: { concert: Concert }) => {
  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-6 backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-white mb-2">{concert.artist}</h1>
      <h2 className="text-2xl text-gray-300 mb-4">{concert.title}</h2>
      <div className="grid grid-cols-2 gap-4 text-gray-400 mb-4">
        <div>
          <p className="font-semibold text-gray-200">Venue</p>
          <p>{concert.venue}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-200">Date</p>
          <p>{concert.date}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-200">Location</p>
          <p>{concert.location}</p>
        </div>
        {concert.attendance && (
          <div>
            <p className="font-semibold text-gray-200">Attendance</p>
            <p>{concert.attendance.toLocaleString()}</p>
          </div>
        )}
      </div>
      <p className="text-gray-300 leading-relaxed">{concert.description}</p>
    </div>
  );
};

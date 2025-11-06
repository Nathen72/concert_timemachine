import { Link } from 'react-router-dom';
import { concerts } from '../data/concerts';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Concert Time Machine</h1>
        <p className="text-gray-400 mb-12">
          Experience legendary concerts as if you were there
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concerts.map((concert) => (
            <Link
              key={concert.id}
              to={`/concert/${concert.id}`}
              className="group relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={concert.posterImage}
                  alt={concert.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">{concert.artist}</h3>
                <p className="text-gray-400">{concert.title}</p>
                <p className="text-sm text-gray-500">{concert.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

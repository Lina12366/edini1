import React, { useEffect, useState } from 'react';
import RootLayout from '../../../layout/RootLayout';
import TopSearchcard from '../../../components/topsearch/TopSearchcard';

const TopSearch = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Fetch routes from the API
    fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/list.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setRoutes(data.routes);
        }
      })
      .catch(error => console.error('Error fetching routes:', error));
  }, []);

  return (
    <RootLayout className="space-y-12 px-4">
      {/* Tag Bus */}
      <div className="w-full flex items-center justify-center text-center">
        <h1 className="text-3xl text-neutral-800 font-bold">
          Top Search Routes <span className="text-red">Bus</span>
        </h1>
      </div>

      {/* Top Search Tickets routes card Bus */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {routes.map((route, index) => (
          <TopSearchcard
            key={route.route_id}
            routeFrom={route.departure_location}
            routeTo={route.arrival_location}
            timeDuration={route.duration || "4 Hours"}
            price={`${route.base_price} DA`}
          />
        ))}
      </div>
    </RootLayout>
  );
};

export default TopSearch;

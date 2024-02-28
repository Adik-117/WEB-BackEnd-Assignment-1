const apiKey = 'AIzaSyA-3dfxmp4jp4uxcu1utfTKDlRryWNsMOQ';

        // Function to fetch latitude and longitude data from a local JSON file
        async function fetchLocationData() {
            try {
                const response = await fetch('/locationData.json'); // Assuming the JSON file is in the same folder
                const data = await response.json();
                return {
                    lat: parseFloat(data.lat),
                    lng: parseFloat(data.lng),
                };
            } catch (error) {
                console.error('Error fetching location data:', error);
                return null;
            }
        }

        // Asynchronously load the Google Maps API script and initialize the map
        async function loadAndInitializeMap() {
            const locationData = await fetchLocationData();

            if (locationData && locationData.lat && locationData.lng) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
                script.defer = true;
                script.async = true;

                document.body.appendChild(script);

                // Add a global variable to store location data for later use in initMap
                window.locationData = locationData;
            } else {
                console.error('Invalid or missing location data.');
            }
        }

        // Initialize the map using the fetched latitude and longitude data
        function initMap() {
            const map = new google.maps.Map(document.getElementById('map'), {
                center: window.locationData,
                zoom: 15
            });

            // Add a marker to the map
            const marker = new google.maps.Marker({
                position: window.locationData,
                map: map,
                title: 'Hello World!'
            });
        }

        // Load the Google Maps API script and initialize the map
        loadAndInitializeMap();
$(document).ready(function () {

    var map;
    var iterator = 0;
    var markers = [];
    var markerLatLng = [
        new google.maps.LatLng(19.423467, -99.017179),
        new google.maps.LatLng(19.429061, -99.182975),
        new google.maps.LatLng(19.427622, -99.326110),
        new google.maps.LatLng(19.413683, -99.244393)
    ];
    var contentString = [
        '<div class="infobox-inner"><a href="08_Properties_Single.html"><img src="assets/img/icon-1.png" alt=""/><span>2,000 MX</span></a></div>',
        '<div class="infobox-inner"><a href="08_Properties_Single.html"><img src="assets/img/icon-2.png" alt=""/><span>6,000 MX</span></div>',
        '<div class="infobox-inner"><a href="08_Properties_Single.html"><img src="assets/img/icon-3.png" alt=""/><span>8,200 MX</span></div>',
        '<div class="infobox-inner"><a href="08_Properties_Single.html"><img src="assets/img/icon-4.png" alt=""/><span>3,400 MX</span></a></div>'
    ];

    function initialize() {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            scrollwheel: false,
            zoom: 12,
            center: new google.maps.LatLng(19.421232, -99.110196) // Mexico
        });
       /* google.maps.event.addListener(map, 'bounds_changed', function() {
            alert(map.getBounds());
        });*/
        setTimeout(function () {
            drop();
        }, 1000);

    }

    // animate markers
    function drop() {
        for (var i = 0; i < markerLatLng.length; i++) {
            setTimeout(function () {
                addMarker();
            }, i * 400);
        }
    }

    function addMarker() {
        var marker = new google.maps.Marker({
            position: markerLatLng[iterator],
            map: map,
            icon: 'assets/img/marker.png',
            draggable: false
            //,animation: google.maps.Animation.DROP
        });
        markers.push(marker);

        var infoBubble = new InfoBubble({
            map: map,
            content: contentString[iterator],
            position: markerLatLng[iterator],
            disableAutoPan: true,
            hideCloseButton: true,
            shadowStyle: 0,
            padding: 0,
            borderRadius: 3,
            borderWidth: 1,
            borderColor: '#74d2b2',
            backgroundColor: '#ffffff',
            backgroundClassName: 'infobox-bg',
            minHeight: 35,
            maxHeight: 230,
            minWidth: 200,
            maxWidth: 300,
            arrowSize: 5,
            arrowPosition: 50,
            arrowStyle: 0
        });

        setTimeout(function () {
            infoBubble.open(map, marker);
        }, 200);

        google.maps.event.addListener(marker, 'click', function () {
            if (!infoBubble.isOpen()) {
                infoBubble.open(map, marker);
            }
            else {
                infoBubble.close(map, marker);
            }
        });

        iterator++;
    }

    google.maps.event.addDomListener(window, 'load', initialize);

});

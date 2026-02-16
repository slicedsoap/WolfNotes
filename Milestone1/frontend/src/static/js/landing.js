document.getElementById('studentLogin').addEventListener('click', function() {
            window.location.href = 'authviews/login.html';
        });

document.getElementById('instructorLogin').addEventListener(
    'click', 
    function() {
        window.location.href = 'authviews/login.html';
    }
);

document.getElementById('studentRegister').addEventListener(
    'click', 
    function() {
        window.location.href = 'authviews/studentRegister.html';
    }
);

document.getElementById('instructorRegister').addEventListener(
    'click', 
    function() {
        window.location.href = 'authviews/instructorRegister.html';
    }
);
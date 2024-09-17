window.onload = function () {
    AOS.init({
        duration: 1000, // Animation Duration (in milliseconds)
        offset: 200, // Offset from top section viewport
        once: true, // Show once or more
        disable: true // Disable or Enable
        // disable: function () {
        //   return window.innerWidth < 1024; // Non-active AOS in mobile screen
        // }
    });

    const spinner = document.getElementById('loading-spinner-init');
    const mainContent = document.getElementById('main-content');

    // Add the fade-out class to start the fade-out animation
    // spinner.classList.add('fade-out');

    // Wait for the transition to complete before fully hiding the element
    setTimeout(function () {
        spinner.style.display = 'none'; // Completely remove spinner from the view
        mainContent.style.display = 'block'; // Show Main Content
        setTimeout(function () {
            mainContent.style.opacity = '1'; // Trigger fade-in
        }, 30); // Slight delay to ensure the transition is applied
    }, 1000); // Match the delay to the transition duration
};

$(document).ready(function () {
    // Set default language to English
    var storedLang = localStorage.getItem('preferredLang') || 'en';
    showLanguage(storedLang);

    // Handle language switch
    $('.language-option').click(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var selectedLang = $(this).data('lang');

        // Don't do anything
        if (selectedLang === storedLang) {
            return;
        }

        localStorage.setItem('preferredLang', selectedLang);
        redirectBasedOnLanguage(selectedLang);
    });

    function showLanguage(lang) {
        $('.lang-en, .lang-id').hide();
        $('.lang-' + lang).show();
    }

    function redirectBasedOnLanguage(lang) {
        if (lang === 'en') {
            window.location.href = 'index.html';
            return;
        } else if (lang === 'id') {
            window.location.href = 'index-indo.html';
            return;
        }

        // Default Page if: lang === null
        window.location.href = 'index.html';
    }

    // Handle Carousel
    var myCarousel = document.querySelector('#portfolioCarousel');
    var carousel = new bootstrap.Carousel(myCarousel, {
        interval: false,  // Non-active automate interval
        ride: false       // Set carousel to not start automatically
    });

    $('#portfolioCarousel').on('slide.bs.carousel', function () {
        AOS.refreshHard(); // Pause AOS animations while carousel slides
    });

    // Scroll to target section with offset
    $('a[href^="#"]').on('click', function (event) {
        // Check if the clicked element is not #carousel-prev or #carousel-next
        if (this.id === 'carousel-prev' || this.id === 'carousel-next') {
            return; // Skip the function for these elements
        }

        event.preventDefault();

        var target = $(this.getAttribute('href'));

        // Calculate offset (e.g., adjust based on navbar height)
        var offset = 70; // Adjust this value as needed
        var scrollTo = target.offset().top - offset;

        $('html, body').animate({
            scrollTop: scrollTo
        }, 0);
    });

    // Hide loading-spinner on Send Message Button for first rendered
    document.getElementById('loading-spinner').style.display = 'none';

    // EmailJS Public Key
    emailjs.init({
        publicKey: 'H4aakXYVmjYE0qvss',
    });

    // Send Email via EmailJS
    document.getElementById('contact-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the button elements
        var sendButton = document.getElementById('send-button');
        var buttonText = document.getElementById('button-text');
        var loadingSpinner = document.getElementById('loading-spinner');

        // Disable the button and show loading spinner
        sendButton.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';

        // Get the form values
        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var message = document.getElementById('message').value;

        // Prepare the parameters for EmailJS
        var templateParams = {
            from_name: name,
            from_email: email,
            message: message
        };

        // Send email using EmailJS
        emailjs.send('service_cto3tnm', 'template_qakrytd', templateParams)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: 'Your message has been sent successfully!',
                    timer: 3000,
                    showConfirmButton: true,
                    timerProgressBar: true,
                    confirmButtonColor: '#28a745' // Custom green color
                }).then(() => {
                    // Re-enable the button and reset text
                    sendButton.disabled = false;
                    buttonText.style.display = 'inline-block';
                    loadingSpinner.style.display = 'none';

                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                });
            }, function (error) {
                console.log('FAILED...', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Message Failed!',
                    text: 'Oops, something went wrong. Please try again later.',
                    timer: 3000,
                    showConfirmButton: true,
                    timerProgressBar: true,
                    confirmButtonColor: '#dc3545' // Custom red color
                }).then(() => {
                    // Re-enable the button and reset text
                    sendButton.disabled = false;
                    buttonText.style.display = 'inline-block';
                    loadingSpinner.style.display = 'none';

                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                });
            });
    });

    // Whatsapp
    document.getElementById('wa-button').addEventListener('click', function () {
        var phoneNumber = "6287808812900";
        var message = null;

        switch (storedLang) {
            case 'en':
                message = "Hello,\n\nI am interested in your services and would like to know more about the details and mechanisms involved.\nCould you please provide more information?\n\nThank you.";
                break;
            case 'id':
                message = "Halo,\n\nSaya tertarik dengan layanan Anda dan ingin mengetahui lebih lanjut tentang detail serta mekanisme yang terlibat.\nBisakah Anda memberikan informasi lebih lanjut?\n\nTerima kasih.";
                break;
            default:
                message = ''
        }

        var encodedMessage = encodeURIComponent(message);
        var waUrl = "https://wa.me/" + phoneNumber + "?text=" + encodedMessage;

        window.open(waUrl, '_blank');
    });
});

//DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check if dark mode is already active from previous visits
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    darkModeToggle.addEventListener('click', function (event) {
        event.preventDefault();
        body.classList.toggle('dark-mode');

        // Save the mode preference in localStorage
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('dark-mode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right').forEach(element => {
        observer.observe(element);
    });
});
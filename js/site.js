// EmailJS
const publicKey = 'H4aakXYVmjYE0qvss';
const serviceId = 'service_cto3tnm';
const templateId = 'template_qakrytd';

// Google reCAPTCHA
const siteKey = '6LdMZEoqAAAAAMtdFnOjePamq4zjzDpC1aA9ptNC';

// Toggle Menu
const toggleButton = $('.navbar-toggler');
const menu = $('.navbar-collapse');

// Toggle Dark Mode
const darkModeToggle = $('#darkModeToggle');
const body = $('body');

// Send Email
const sendButton = $('#send-button');
const buttonText = $('#button-text');
const loadingSpinner = $('#loading-spinner');
const recaptchaWarning = $('#recaptcha-warning');

// DOM
$(document).ready(function () {
    // Check if dark mode is already active from previous visits
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.addClass('dark-mode'); // Add dark mode class to body
        darkModeToggle.html('<i class="fas fa-sun"></i>'); // Update the toggle button
    }

    // Auto Dark or Light Mode
    if (autoRunTheme()) {
        applyModeBasedOnTime(body);
    }

    // Auto Dark or Light Mode: Run Checking every 1 minute
    setInterval(function () {
        if (autoRunTheme()) {
            applyModeBasedOnTime(body);
        }
    }, 60000);

    darkModeToggle.on('click', function (event) {
        event.preventDefault();

        body.toggleClass('dark-mode'); // Toggle dark mode class on body

        // Save the mode preference in localStorage
        if (body.hasClass('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled'); // Save preference
            $(this).html('<i class="fas fa-sun"></i>'); // Update icon to sun
        } else {
            localStorage.setItem('dark-mode', 'disabled'); // Save preference
            $(this).html('<i class="fas fa-moon"></i>'); // Update icon to moon
        }
    });

    $(document).on('click', function (event) {
        // Check if the toggle button is not collapsed, the menu is shown,
        // and the click target is not inside a dropdown item
        if (!toggleButton.hasClass('collapsed')
            && menu.hasClass('show')
            && !$(event.target).closest('.nav-item.dropdown').length) {
            toggleButton.click(); // Simulate a click on the toggle button to close the menu
        }
    });

    // Set default language to English
    const storedLang = localStorage.getItem('lang') || 'en';
    showLanguage(storedLang);

    // Handle language switch
    $('.language-option').click(function (e) {
        e.preventDefault(); // Prevent default action of the click event
        e.stopPropagation(); // Stop the event from bubbling up to parent elements

        const selectedLang = $(this).data('lang'); // Get the selected language from the clicked element

        // Don't do anything if the selected language is the same as the stored language
        if (selectedLang === storedLang) {
            return;
        }

        localStorage.setItem('lang', selectedLang); // Store the selected language in localStorage
        redirectBasedOnLanguage(selectedLang); // Redirect based on the selected language

        // Save Selected Lang in Backend Local Storage for reason: We don't want show the file name in URL
        $.post('/save-lang', { lang: selectedLang });
    });

    // Handle Carousel
    const myCarousel = $('#portfolioCarousel');
    new bootstrap.Carousel(myCarousel, {
        interval: false,  // Non-active automate interval
        ride: false       // Set carousel to not start automatically
    });

    myCarousel.on('slide.bs.carousel', function () {
        AOS.refreshHard(); // Pause AOS animations while carousel slides
    });

    // Define the options for the Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Create the Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('visible'); // Use jQuery to add the 'visible' class
                observer.unobserve(entry.target); // Stop observing the target
            }
        });
    }, observerOptions);

    // Observe elements with specified classes using jQuery
    $('.fade-in, .slide-up, .slide-left, .slide-right').each(function () {
        observer.observe(this); // Start observing each element
    });

    // Scroll to target section with offset
    $('a[href^="#"]').on('click', function (event) {
        // Check if the clicked element is not #carousel-prev or #carousel-next
        if (this.id === 'carousel-prev' || this.id === 'carousel-next') {
            return; // Skip the function for these elements
        }

        event.preventDefault(); // Prevent the default anchor behavior

        const target = $(this.getAttribute('href')); // Get the target element

        if (target.length) { // Check if the target exists
            // Calculate offset (e.g., adjust based on navbar height)
            const offset = 70; // Adjust this value as needed
            const scrollTo = target.offset().top - offset; // Calculate scroll position

            $('html, body').animate({
                scrollTop: scrollTo // Animate scroll
            }, 0); // Set duration for a smoother experience
        }
    });

    // Hide loading-spinner on Send Message Button for first rendered
    loadingSpinner.css('display', 'none');

    // EmailJS Public Key
    emailjs.init({
        publicKey: publicKey,
    });

    // Send Email via EmailJS
    $('#contact-form').on('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Validate the reCAPTCHA token
        grecaptcha.ready(function () {
            const token = grecaptcha.getResponse(); // Get the reCAPTCHA response token

            // reCAPTCHA Checked?
            if (!token || token === '') {
                recaptchaWarning.removeClass('recaptcha-warning-hide');
                recaptchaWarning.addClass('recaptcha-warning-show');

                return;
            }
            else {
                recaptchaWarning.removeClass('recaptcha-warning-show');
                recaptchaWarning.addClass('recaptcha-warning-hide');
            }

            // Process Validate
            validateToken(token).then(isSuccessValidate => {
                if (isSuccessValidate) {
                    sendEmail(token); // Send email if validation is successful
                } else {
                    // Show alert if validation fails
                    swalShow(false, 'Message Failed!', 'Please check the reCAPTCHA.');
                    console.error('reCAPTCHA validation failed!');
                }
            }).catch(error => {
                // Handle error during token validation
                swalShow(false, 'Message Failed!', 'Oops, something went wrong. Please try again later.');
                console.error('Token validation failed! Details: ', error);
            });
        });
    });

    // WhatsApp button click event
    $('#wa-button').on('click', function () {
        const phoneNumber = "6287808812900"; // Define the phone number
        let message = null; // Initialize message as null

        // Construct the message based on stored language
        switch (storedLang) {
            case 'en':
                message = "Hello,\n\nI am interested in your services and would like to know more about the details and mechanisms involved.\nCould you please provide more information?\n\nThank you.";
                break;
            case 'id':
                message = "Halo,\n\nSaya tertarik dengan layanan Anda dan ingin mengetahui lebih lanjut tentang detail serta mekanisme yang terlibat.\nBisakah Anda memberikan informasi lebih lanjut?\n\nTerima kasih.";
                break;
            default:
                message = ''; // Default to an empty message
        }

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        const waUrl = "https://wa.me/" + phoneNumber + "?text=" + encodedMessage; // Construct the WhatsApp URL

        // Open the WhatsApp URL in a new tab
        window.open(waUrl, '_blank');
    });
});

// If DOM rendered, run logic below
$(window).on('load', function () {
    const mainContent = $('#main-content');
    const spinner = $('#loading-spinner-init');

    // Add the fade-out class to start the fade-out animation
    // spinner.addClass('fade-out');

    // Wait for the transition to complete before fully hiding the element
    setTimeout(function () {
        spinner.css('display', 'none'); // Completely remove spinner from the view
        mainContent.css('display', 'block'); // Show Main Content

        setTimeout(function () {
            mainContent.css('opacity', '1'); // Trigger fade-in

            // Animate on Scroll
            AOS.init({
                duration: 750, // Animation Duration (in milliseconds)
                offset: 50, // Offset from top section viewport
                once: true, // Show once or more
                disable: false // Disable or Enable
                // disable: function () {
                //   return $(window).width() < 1024; // Non-active AOS in mobile screen
                // }
            });
        }, 30); // Slight delay to ensure the transition is applied

    }, 1000); // Match the delay to the transition duration
});

// All Declared Functions
function showLanguage(lang) {
    // Hide all language elements
    $('.lang-en, .lang-id').hide();

    // Show the selected language element
    $('.lang-' + lang).show();
}

function redirectBasedOnLanguage(lang) {
    // // Check the selected language and redirect accordingly
    // if (lang === 'en') {
    //     window.location.href = 'index.html'; // Redirect to the English version
    // } else if (lang === 'id') {
    //     window.location.href = 'index-indo.html'; // Redirect to the Indonesian version
    // } else {
    //     // Default Page if lang is null or unrecognized
    //     window.location.href = 'index.html'; // Redirect to the default page
    // }

    window.location.reload();
}

function validateToken(token) {
    // Send the reCAPTCHA token to the backend for validation
    return $.ajax({
        url: '/validate-token',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            g_recaptcha_token: token
        }),
        dataType: 'json'
    }).done(function (data) {
        // Assume 'success' is a boolean that indicates token validation result
        return data.success;
    }).fail(function (error) {
        // console.error('Error during token validation:', error);
        return false;
    });
}

function sendEmail(token) {
    // Get the form values
    const name = $('#name').val();
    const email = $('#email').val();
    const message = $('#message').val();

    // Disable the button and show loading spinner
    sendButton.prop('disabled', true);
    buttonText.hide();
    loadingSpinner.show();

    // Prepare the parameters for EmailJS
    const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        'g-recaptcha-response': token
    };

    // Send email using EmailJS
    emailjs.send(serviceId, templateId, templateParams)
        .then(function (response) {
            resetForm();
            swalShow(true, 'Message Sent!', 'Your message has been sent successfully!');
            console.log('Success!', response.status, response.text);
        }).catch(function (error) {
            swalShow(false, 'Message Failed!', 'Oops, something went wrong. Please try again later.');
            console.error('Failed to send email:', error);
        }).finally(function () {
            grecaptcha.reset();

            // Re-enable the button
            sendButton.prop('disabled', true);
            buttonText.show();
            loadingSpinner.hide();
        });
}

function resetForm() {
    $('#name').val('');    // Clear the value in the name input field
    $('#email').val('');   // Clear the value in the email input field
    $('#message').val(''); // Clear the value in the message textarea
}

function onloadCallback() {
    grecaptcha.render('recaptcha', {           // Render the reCAPTCHA element
        'sitekey': siteKey,                    // Set the site key for reCAPTCHA
        'callback': function () {              // Callback function when reCAPTCHA is successfully completed
            onReCaptchaSuccess();              // Enable the send button
        },
        'expired-callback': onReCaptchaExpired // Callback function when reCAPTCHA expires
    });
}

function onReCaptchaSuccess() {
    $('#send-button').prop('disabled', false); // Enable the send button

    recaptchaWarning.removeClass('recaptcha-warning-show');
    recaptchaWarning.addClass('recaptcha-warning-hide');
}

function onReCaptchaExpired() {
    $('#send-button').prop('disabled', true); // Disable the send button

    recaptchaWarning.removeClass('recaptcha-warning-show');
    recaptchaWarning.addClass('recaptcha-warning-hide');
}

function swalShow(isSuccess, title, message) {
    Swal.fire({
        icon: isSuccess ? 'success' : 'error', // Set icon based on success or error
        title: title, // Set the title of the alert
        text: message, // Set the message of the alert
        timer: 3000, // Duration in milliseconds before the alert closes automatically
        showConfirmButton: true, // Show the confirm button
        timerProgressBar: true, // Show a progress bar for the timer
        confirmButtonColor: isSuccess ? '#28a745' : '#dc3545' // Set confirm button color based on success
    });
}

function applyModeBasedOnTime(body) {
    const currentHour = new Date().getHours(); // Get the current hour (0-23)

    // Check if the current time is during the day (6 AM to 6 PM)
    if (currentHour >= 6 && currentHour < 18) {
        localStorage.setItem('dark-mode', 'disabled'); // Store preference for light mode
        body.removeClass('dark-mode'); // Remove dark mode class from the body
        darkModeToggle.html('<i class="fas fa-moon"></i>'); // Change icon to moon (for toggling to dark mode)
    } else {
        localStorage.setItem('dark-mode', 'enabled'); // Store preference for dark mode
        body.addClass('dark-mode'); // Add dark mode class to the body
        darkModeToggle.html('<i class="fas fa-sun"></i>'); // Change icon to sun (for toggling to light mode)
    }
}

function autoRunTheme() {
    const today = new Date().toLocaleDateString(); // Format today's date: 'MM/DD/YYYY'
    const currentHour = new Date().getHours();
    const lastRunDate = localStorage.getItem('last-run-date');
    const isDayRan = localStorage.getItem('day-ran');
    const isNightRan = localStorage.getItem('night-ran');

    // Check if the last run date is not today
    if (lastRunDate !== today) {
        localStorage.setItem('last-run-date', today);
        localStorage.setItem('day-ran', false);
        localStorage.setItem('night-ran', false);
    }

    // Check if it's day time and if the day theme hasn't been run yet
    if (currentHour >= 6 && currentHour < 18 && !isDayRan) {
        localStorage.setItem('day-ran', true);
        return true; // Day theme should run
    }
    // Check if it's night time and if the night theme hasn't been run yet
    else if ((currentHour >= 18 || currentHour < 6) && !isNightRan) {
        localStorage.setItem('night-ran', true);
        return true; // Night theme should run
    }

    return false; // No theme changes needed
}
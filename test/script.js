// script.js

// Get the button
const backToTopBtn = document.getElementById("backToTopBtn");

// Show or hide the button based on scroll position
window.addEventListener("scroll", () => {
  // Get the scroll position
  const scrollY = window.scrollY || window.pageYOffset;

  console.log(scrollY);
  
  // Show the button after scrolling down 100px
//   if (scrollY > 100) {
//     backToTopBtn.style.display = "block";
//   } else {
//     backToTopBtn.style.display = "none";
//   }
});

// Scroll to top when the button is clicked
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth" // For smooth scrolling
  });
});

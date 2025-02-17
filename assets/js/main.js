// Error handling
window.addEventListener("error", (e) => {
  console.error("Global error handler:", e.error)
  // You could send this error to your error tracking service here
})

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === "largest-contentful-paint") {
      console.log("LCP:", entry.startTime)
      // You could send this metric to your analytics service here
    }
  })
})
perfObserver.observe({ type: "largest-contentful-paint", buffered: true })

// Lazy loading images
if ("loading" in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]')
  images.forEach((img) => {
    img.src = img.dataset.src
  })
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement("script")
  script.src = "/assets/js/lazysizes.min.js"
  document.body.appendChild(script)
}

// Dark mode toggle
const darkModeToggle = document.getElementById("dark-mode-toggle")
const body = document.body

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode")
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"))
  })

  // Check for saved dark mode preference
  if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark-mode")
  }
}

// Algolia search (only load if the element exists)
if (document.getElementById("autocomplete")) {
  const algoliasearch = require("algoliasearch") // Import algoliasearch library
  const autocomplete = require("autocomplete.js") // Import autocomplete.js library

  const searchClient = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_API_KEY")

  autocomplete({
    container: "#autocomplete",
    placeholder: "Search articles",
    debug: false, // Set to false in production
    getSources({ query }) {
      return [
        {
          sourceId: "posts",
          getItems() {
            return searchClient
              .search([
                {
                  indexName: "YOUR_ALGOLIA_INDEX_NAME",
                  query,
                  params: {
                    hitsPerPage: 5,
                  },
                },
              ])
              .then(({ results }) => results[0].hits)
          },
          templates: {
            item({ item, components, html }) {
              return html`
                <div class="aa-ItemWrapper">
                  <div class="aa-ItemContent">
                    <div class="aa-ItemContentBody">
                      <div class="aa-ItemTitle">
                        ${components.Highlight({
                          hit: item,
                          attribute: "title",
                        })}
                      </div>
                      <div class="aa-ItemDescription">
                        ${components.Snippet({
                          hit: item,
                          attribute: "content",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              `
            },
          },
        },
      ]
    },
  })
}

// Cookie consent
const cookieBanner = document.getElementById("cookie-consent-banner")
const acceptButton = document.getElementById("accept-cookies")

if (cookieBanner && acceptButton) {
  if (!localStorage.getItem("cookiesAccepted")) {
    cookieBanner.style.display = "block"
  }

  acceptButton.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true")
    cookieBanner.style.display = "none"
  })
}

// Newsletter popup
const newsletterPopup = document.getElementById("newsletter-popup")
const closeNewsletterPopup = document.getElementById("close-newsletter-popup")
const newsletterForm = document.getElementById("newsletter-form")

if (newsletterPopup && closeNewsletterPopup && newsletterForm) {
  if (!localStorage.getItem("newsletterPopupShown")) {
    setTimeout(() => {
      newsletterPopup.style.display = "block"
    }, 5000)
  }

  closeNewsletterPopup.addEventListener("click", () => {
    newsletterPopup.style.display = "none"
    localStorage.setItem("newsletterPopupShown", "true")
  })

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    newsletterPopup.style.display = "none"
    localStorage.setItem("newsletterPopupShown", "true")
  })
}

// Back to top button
const backToTopButton = document.getElementById("back-to-top")

if (backToTopButton) {
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = "block"
    } else {
      backToTopButton.style.display = "none"
    }
  })

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
}

// Reading progress bar
const progressBar = document.createElement("div")
progressBar.className = "reading-progress-bar"
document.body.appendChild(progressBar)

window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
  progressBar.style.width = scrollPercentage + "%"
})

// Infinite scroll for blog posts
const blogPosts = document.querySelector(".blog-posts")
if (blogPosts) {
  let currentPage = 1
  const loadMoreButton = document.createElement("button")
  loadMoreButton.textContent = "Load More"
  loadMoreButton.className = "load-more-button"
  blogPosts.after(loadMoreButton)

  loadMoreButton.addEventListener("click", loadMorePosts)

  function loadMorePosts() {
    currentPage++
    fetch(`/page${currentPage}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.text()
      })
      .then((html) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")
        const posts = doc.querySelectorAll(".blog-post")
        posts.forEach((post) => blogPosts.appendChild(post))
        if (posts.length === 0) {
          loadMoreButton.style.display = "none"
        }
      })
      .catch((error) => {
        console.error("Error loading more posts:", error)
        loadMoreButton.textContent = "Error loading posts. Try again."
      })
  }
}


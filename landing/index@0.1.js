gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
let lenis;

 if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration:1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}


let isMobile = window.innerWidth < 550;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

CustomEase.create(
  "main",
  "0.65, 0.01, 0.05, 0.99"
);

gsap.defaults({
  ease:"main",
  duration:0.725
})




function handleOrientationChange() {
  setTimeout(function () {
    window.location.reload();
  }, 250);
}
window.addEventListener("orientationchange", handleOrientationChange);

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function initSplit(next) {
  let lineTargets = next.querySelectorAll('[data-split="lines"]')
  let letterTargets = next.querySelectorAll('[data-split="letters"]')
  let headings = next.querySelectorAll("[data-heading]")

  var splitTextLines = new SplitText(lineTargets, {
    type: "lines",
    linesClass: "single-line"
  });
  
  splitTextLines.lines.forEach((line, index) => {
    let wrapper = document.createElement('div');
    wrapper.classList.add('single-line-wrap');
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
  });  

  var splitTextLetters = new SplitText(letterTargets, {
    type: "chars",
    charsClass: "single-letter"
  });
  
  
  splitTextLetters.chars.forEach((letters, index) => {
    let delay = (index / 100) + 's';
    letters.style.setProperty('transition-delay', delay);
  })
  
  //
  //
  
  headings.forEach(heading => {
    let animatedHeadings = new SplitText(heading, {
      type: "lines, words",
      linesClass: "single-line"
    });
  
    animatedHeadings.lines.forEach((line, index) => {
      let wrapper = document.createElement('div');
      wrapper.classList.add('single-line-wrap');
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      
      let delay = (index / 10) + 's';
      line.style.setProperty('transition-delay', delay);
    });
  
    if (heading.hasAttribute("heading-reveal-scroll")) {
      ScrollTrigger.create({
        trigger: heading,
        start: "top 95%",
        onEnter: () => {
          heading.setAttribute("data-heading", "visible");
        }
      });
    }
  });
  
  
}

function initPageLoad(next){
  
  const nav = next.querySelector(".nav-w")
  const main = next || document.querySelector(".main-w")
  const hero = main.querySelector(".section")
  const navLinks = nav.querySelectorAll(".li")
  const navLogo = nav.querySelector(".nav-logo")
  const loadTargets = next.querySelectorAll("[data-load-stagger]")
  const titles = hero.querySelectorAll("[heading-reveal-load]")
  const homeImage = hero.querySelector(".hero-img__wrap")
  
  let tl = gsap.timeline({
    onStart:()=>{
      titles.forEach((title) =>{
        gsap.delayedCall(0.1, ()=>{
          title.setAttribute("data-heading", "visible")
        })
        
      })
    }
  })
  
  tl.set([main, nav],{ autoAlpha: 1})
  .from(navLinks,{ yPercent: 125, stagger: 0.1})
  .from(loadTargets,{ yPercent: 40, autoAlpha: 0, stagger:0.08},"<")
  
  if(main.hasAttribute("data-barba-namespace","home")){
    tl.from(homeImage,{clipPath:"inset(50%)",duration:1})
  }

}

function initHeadings(next) {
  let targets = next.querySelectorAll("[data-heading-reveal]");

  targets.forEach(heading => {
    const originalText = heading.textContent;
    heading.textContent = "";
    const chars = originalText.split("");

    const cursor = document.createElement("span");
    cursor.classList.add("cursor");
    cursor.textContent = "|";
    heading.appendChild(cursor);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 80%",
      }
    });

    chars.forEach((char, i) => {
      tl.to({}, {
        duration: gsap.utils.random(0.03 , 0.2),
        onUpdate: () => {
          heading.textContent = originalText.slice(0, i + 1); 
          heading.appendChild(cursor); 
        },
        ease: "none"
      });
    });

    tl.to(cursor, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => cursor.remove()
    });
  });
}

function initPeopleHero(next) {
    const listElement = next.querySelector('[data-people="list"]');
    const wrapDesktop = next.querySelector('[data-people="wrap-desktop"]');
    const wrapMobile = next.querySelector('[data-people="wrap-mobile"]');
    const items = listElement ? listElement.querySelectorAll('[data-people="item"]') : null;

    if (listElement && items) {
      if(isMobileLandscape){
        wrapMobile.appendChild(listElement);
      } else{
        wrapDesktop.appendChild(listElement);
      }
      
        items.forEach(item => {
            gsap.set(item, { autoAlpha: 0 });
        });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

function initTypeformTriggers(next){
  let wrappers = next.querySelectorAll("[data-form-container]")
  if(wrappers.length > 0){
    
    wrappers.forEach((wrapper) => {
      let button = wrapper.querySelector(".button")
      
      button.addEventListener("click", () => {
        let tf = wrapper.querySelector("button")
        tf.click()
      })
      
    });
    
  }
}

function initLocationGIF(next) {
  
  const items = next.querySelectorAll("[data-city-item]")

    if (items) {

        items.forEach(item => { gsap.set(item, { autoAlpha: 0 }); });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

function initReelGIF(next){
    const items = next.querySelectorAll("[data-reel-item]")

    if (items) {

        items.forEach(item => { gsap.set(item, { autoAlpha: 0 }); });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

//
//
//
//
//
//
//
//
//

function initGeneral(next){
  initPageLoad(next)

  document.fonts.ready.then(() => {
    initSplit(next) 
  })
  initPeopleHero(next)
  initReelGIF(next)
  initTypeformTriggers(next)
  initLocationGIF(next)

}

document.addEventListener("DOMContentLoaded", () => {
  initGeneral(document)
})


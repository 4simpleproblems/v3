(function() {
    var elements = document.querySelectorAll('.sc-978a7a9c-0.jUWcJN');
    elements.forEach(function(element) {
        element.classList.remove('sc-978a7a9c-0', 'jUWcJN');
        
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    });
})();

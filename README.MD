## **About**

This repository contains pages (published as GitHub pages) to be implemented as iframes.

Library data is pulled from the kirkanta-api: https://github.com/libraries-fi/kirkanta-api and the UI is loosely inspired by kirjastohakemisto.fi https://github.com/libraries-fi/kirjastohakemisto

This implementation is currently used in [Keski-libraries,](https://www.keskikirjastot.fi/web/arena)  [Jyvaskyla](https://www.jyvaskyla.fi/kirjasto/kirjastot ) and + standalone schedules in info-screens & https://www.jyvaskyla.fi/kirjasto/kirjastot/omatoimikirjastot.

### **Usage scenarios**

- [Details of a library](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/examples/library-example.html)
- [Opening times of a library](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/examples/schedule-example.html) | [Large schedules for info screens](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/schedule.html?lib=85160&lang=fi&large=true) (1080x1920, "smart" font sizing)
- [Libraries of a consortium](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/examples/consortium-example.html)
- [Libraries of a city](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/examples/city-example.html?jyvaskylan-paakirjasto) (Mobile libraries are ignored, because in JKL, they have their own page)
- [Single day schedules with a library selector](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/examples/home-example.html)

### **Features**

In addition to the basic features, this implementation has some extras, some of which are described in the following table in no particular order.

| Feature                              | Explanation                                                  |
| ------------------------------------ | ------------------------------------------------------------ |
| Rendering of accessibility services  | Currently the following saavutettavuus-palvelut are shown as accessibility icons and translated to English: Esteetön sisäänpääsy, Invapysäköinti, Esteetön WC, Hissi, Induktiosilmukka. Usage: Write service names to "Short description", full descriptions is shown below. |
| Automatic image slider               | Slider for images                                            |
| Keyboard navigation                  | Keyboard arrow navigation for schedules, images & moving between "Info" & "Contact details". |
| Swipe navigation                     | Navigate schedules & images by swiping gestures on touchscreens. |
| Rendering of iframes                 | If service/department description includes link that contains "embed", it is rendered as iframe instead. e.g. https://www.jyvaskyla.fi/kirjasto/kirjastot?jyvaskylan-paakirjasto?soitonharjoitteluhuoneet |
| External linkls                      | All links that are not pointing to the parent url are turned into external links. External links also have an icon to clarify them.  Iframes can't redirect parent page to external sites. |
| Transit directions                   | Link to transit directions for matka.fi or Google maps is generated automatically based on address & coordinates. |
| Checking for duplicated contacts     | Duplicated contact details are not displayed in the contact details list. |
| Url navigation                       | With some .js on parent side, it is possible to update the url based on which library, tab (contacts) or service is opened. This url can then be shared and the correct page will open automatically. |
| Images in descriptions               | Images in descriptions are responsive & styled with borders. |
| Customise styles with .less          | It is possible to customise the styling of the frames by providing them via parameters.<br />Currently the following parameters are available: primary, links, linksHover, linksExternal, btnHover. |
| Rendering of departments as services | Departments are included in services in the "Rooms and collections" -section. |
| And more...                          | This list may be appended in the future.                     |

### Technologies

Since .less was added, you pretty much need to run the files in a "local server" of some sort to avoid CORS errors. Other than that, just open the files in browser.

| Library name             | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| .less                    | Dynamic styles                                             |
| Bootstrap 4              | Styles!                                                    |
| Font Awesome             | Icons                                                      |
| JQuery 3                 | Makes things easier.                                       |
| JQuery Translate         | Translations.                                              |
| Moment.js                | Formatting times.                                          |
| Select2                  | Library selector                                           |
| rsSlides                 | Image slider                                               |
| Leaflet                  | Adds functionality to OpenStreetMaps, use Wikimedia tiles. |
| Did we forget something? | I hope not...                                              |



### **Limitations:**  

- Iframes must open links in new tab

- Iframes can't detect parent's scroll position

  

### To do...

As of now, there is no public backlog, I use Trello -boards for planning things.

Feel free to contact me for questions etc.
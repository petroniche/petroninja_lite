# Petro Ninja Lite

Petro Ninja Lite is a collection of html, csv and js files that provide the basic functionality and look and feel of https://www.petroninja.com/. Included in the JS files is the Petro Ninja Data JS Library that provides an easy way to integrate with the Petro Ninja API. Petro Ninja Lite is a starting point for companies looking to integrate the Petro Ninja map and data into their own system.

To start using Petro Ninja Lite you require a Mapbox and Petro Ninja Data API Keys. To obtain these keys, lease send a request to info@petroniche.com.

# Petro Ninja Data API
To view the Petro Ninja API documention: https://www.petroninja.com/api_documentation/index.html#/

# Petro Ninja Data JavaScript Library
Use our Javascript Library to easily communicate with the Petro Ninja API. The library is used by Petro Ninja Lite and petroninja.com. It can be found in js/petroninja_lib.js

# Petro Ninja Lite IFrame
Include the PetroNinja IFrame in your website to display the Petro Ninja Map and basic well data. See sample file in the IFrame folder or use the code snippet below:

Default Petro Ninja Map
To include the default Petro Ninja IFrame add the following snipped to your HTML:	
```html
<iframe src="https://www.petroninja.com/PetroNinjaLite/index.html" height="500px" width="1000px"></iframe>
```
Petro Ninja Map + Well List.
To show a well list within the IFrame, add the identifier as a parameter in the URL:
```html
<iframe src="https://www.petroninja.com/PetroNinjaLite/index.html?list=QndUdK" height="500px" width="1000px"></iframe>
```

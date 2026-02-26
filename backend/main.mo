import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  type MenuItemId = Nat;

  public type Category = {
    #appetizer;
    #mainCourse;
    #dessert;
    #beverage;
  };

  public type MenuItem = {
    id : MenuItemId;
    name : Text;
    description : Text;
    price : Float;
    category : Category;
    isAvailable : Bool;
    imageUrl : ?Text;
  };

  public type UpiSettings = {
    upiId : Text;
    merchantName : Text;
    qrCodeData : Text;
  };

  let menuItems = Map.empty<MenuItemId, MenuItem>();
  var nextMenuItemId = 1;

  var upiSettings : ?UpiSettings = null;

  let accessControlState = AccessControl.initState();

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func addMenuItem(
    name : Text,
    description : Text,
    price : Float,
    category : Category,
    imageUrl : ?Text,
  ) : async MenuItemId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };

    let menuItemId = nextMenuItemId;
    nextMenuItemId += 1;

    let newItem : MenuItem = {
      id = menuItemId;
      name;
      description;
      price;
      category;
      isAvailable = true;
      imageUrl;
    };

    menuItems.add(menuItemId, newItem);
    menuItemId;
  };

  public shared ({ caller }) func updateMenuItem(
    id : MenuItemId,
    name : Text,
    description : Text,
    price : Float,
    category : Category,
    imageUrl : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?menuItem) {
        let updatedItem : MenuItem = {
          id;
          name;
          description;
          price;
          category;
          isAvailable = menuItem.isAvailable;
          imageUrl;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : MenuItemId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };

    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item not found");
    };

    menuItems.remove(id);
  };

  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    let itemsArray = menuItems.values().toArray();
    let filteredItems = itemsArray.filter(func(item) { item.isAvailable });
    filteredItems;
  };

  public shared ({ caller }) func toggleAvailability(id : MenuItemId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle availability");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?menuItem) {
        let updatedItem : MenuItem = {
          id;
          name = menuItem.name;
          description = menuItem.description;
          price = menuItem.price;
          category = menuItem.category;
          isAvailable = not menuItem.isAvailable;
          imageUrl = menuItem.imageUrl;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func updateUpiSettings(newSettings : UpiSettings) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    upiSettings := ?newSettings;
  };

  public query ({ caller }) func getUpiSettings() : async ?UpiSettings {
    upiSettings;
  };
};

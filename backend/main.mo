import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  public type UserProfile = {
    name : Text;
  };

  let menuItems = Map.empty<MenuItemId, MenuItem>();
  var nextMenuItemId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Store payment QR code image data (base64 or URL)
  var paymentQRCode : ?Text = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addMenuItem(name : Text, description : Text, price : Float, category : Category, imageUrl : ?Text) : async MenuItemId {
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

  public shared ({ caller }) func updateMenuItem(id : MenuItemId, name : Text, description : Text, price : Float, category : Category, imageUrl : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?existingItem) {
        let updatedItem : MenuItem = {
          id;
          name;
          description;
          price;
          category;
          isAvailable = existingItem.isAvailable;
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
    menuItems.values().toArray();
  };

  public shared ({ caller }) func toggleAvailability(id : MenuItemId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle availability");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?existingItem) {
        let updatedItem : MenuItem = {
          id;
          name = existingItem.name;
          description = existingItem.description;
          price = existingItem.price;
          category = existingItem.category;
          isAvailable = not existingItem.isAvailable;
          imageUrl = existingItem.imageUrl;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  // Admin-only: Set the payment QR code (base64 or image URL)
  public shared ({ caller }) func setPaymentQRCode(data : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    paymentQRCode := ?data;
  };

  // Public: Get the payment QR code image data
  public query ({ caller }) func getPaymentQRCode() : async ?Text {
    paymentQRCode;
  };
};

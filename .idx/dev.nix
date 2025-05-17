{ pkgs, ... }: {

  # NOTE: This is an excerpt of a complete Nix configuration example.
  # For more information about the dev.nix file in Firebase Studio, see
  # https://firebase.google.com/docs/studio/customize-workspace

  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
    previews = {
      # The following object sets web previews
      web = {
        command = [
          "npm"
          "run"
          "dev" # Changed from "start" to "dev"
          "--"  # Separator for npm script arguments
          "-p"  # Next.js dev server port flag
          "$PORT" # Port provided by Firebase Studio
        ];
        manager = "web";
      };
      # The following object sets Android previews
      # Note that this is supported only on Flutter workspaces
      # android = {
      #   manager = "flutter";
      # };
    };
  };
}

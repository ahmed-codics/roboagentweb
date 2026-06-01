export type DocLink = { title: string; slug: string };
export type DocGroup = { title: string; links: DocLink[] };

export const DOCS_NAV: DocGroup[] = [
  {
    title: "Getting Started",
    links: [
      { title: "Introduction", slug: "" },
      { title: "Installation", slug: "installation" },
      { title: "System Requirements", slug: "system-requirements" },
      { title: "First Launch", slug: "first-launch" },
      { title: "Creating a Workspace", slug: "creating-workspace" },
      { title: "Connecting ROS2", slug: "connecting-ros2" },
    ],
  },
  {
    title: "ROS2 Integration",
    links: [
      { title: "Workspace Indexing", slug: "ros2/indexing" },
      { title: "colcon Integration", slug: "ros2/colcon" },
      { title: "Launch Files", slug: "ros2/launch" },
      { title: "TF Trees", slug: "ros2/tf" },
      { title: "Nav2", slug: "ros2/nav2" },
      { title: "QoS Analysis", slug: "ros2/qos" },
    ],
  },
  {
    title: "AI Features",
    links: [
      { title: "AI Code Generation", slug: "ai/codegen" },
      { title: "AI Debugging", slug: "ai/debug" },
      { title: "Simulation Analysis", slug: "ai/sim-analysis" },
      { title: "Autonomous Agents", slug: "ai/agents" },
      { title: "Context Engine", slug: "ai/context" },
    ],
  },
  {
    title: "Simulation",
    links: [
      { title: "Gazebo Setup", slug: "sim/gazebo" },
      { title: "Running Simulations", slug: "sim/running" },
      { title: "Automated Testing", slug: "sim/testing" },
      { title: "AI Sim Debugging", slug: "sim/debug" },
    ],
  },
  {
    title: "Embedded Development",
    links: [
      { title: "STM32 Support", slug: "embedded/stm32" },
      { title: "ESP32 Support", slug: "embedded/esp32" },
      { title: "FreeRTOS", slug: "embedded/freertos" },
      { title: "PlatformIO", slug: "embedded/platformio" },
    ],
  },
  {
    title: "Deployment",
    links: [
      { title: "Jetson Deployment", slug: "deploy/jetson" },
      { title: "Raspberry Pi", slug: "deploy/raspberry-pi" },
      { title: "Docker", slug: "deploy/docker" },
    ],
  },
  {
    title: "Tutorials",
    links: [
      { title: "Build a Mobile Robot", slug: "tutorials/mobile-robot" },
      { title: "Create a SLAM Project", slug: "tutorials/slam" },
      { title: "Debug TF Issues", slug: "tutorials/tf-debug" },
      { title: "Build a ROS2 Node", slug: "tutorials/ros2-node" },
      { title: "Analyze a Bag File", slug: "tutorials/bag-analysis" },
    ],
  },
  {
    title: "Reference",
    links: [
      { title: "CLI", slug: "ref/cli" },
      { title: "Tools (RKG, Bag, Sim)", slug: "ref/tools" },
      { title: "Configuration", slug: "ref/config" },
      { title: "API", slug: "ref/api" },
      { title: "Changelog", slug: "changelog" },
    ],
  },
];

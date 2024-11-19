#pragma once

#include "webui.hpp"

void handle_submit_url(webui::window::event* event);

// Send a log message to the frontend
void send_log(webui::window::event* event, std::string const& message);

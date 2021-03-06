class Exception
  def initialize(message = '')
    `Error.captureStackTrace(self, self.m$raise);`
    @message = message
  end

  def ==(*)
    raise NotImplementedError, 'Exception#== not yet implemented'
  end

  def backtrace
    @backtrace ||= `VM.backtrace(self)`
  end

  def awesome_backtrace
    @backtrace ||= `VM.awesome_backtrace(self)`
  end

  def exception(*)
    raise NotImplementedError, 'Exception#exception not yet implemented'
  end

  def inspect
    "#<#{self.class}: '#{message}'>"
  end

  def message
    @message
  end

  def set_backtrace(*)
    raise NotImplementedError, 'Exception#set_backtrace not yet implemented'
  end

  alias_method :to_s, :message
end
